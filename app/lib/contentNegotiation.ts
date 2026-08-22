export const PRODUCED_CONTENT_TYPES = ["text/html", "text/markdown"] as const;

export type ProducedContentType = (typeof PRODUCED_CONTENT_TYPES)[number];

type AcceptEntry = {
  type: string;
  q: number;
  specificity: number;
};

function parseAccept(header: string): AcceptEntry[] {
  return header.split(",").map((raw) => {
    const parts = raw
      .trim()
      .split(";")
      .map((part) => part.trim());
    const type = parts[0].toLowerCase();
    let q = 1;

    for (const parameter of parts.slice(1)) {
      const [name, value] = parameter
        .split("=")
        .map((part) => part.trim());

      if (name.toLowerCase() === "q") {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) {
          q = Math.max(0, Math.min(1, parsed));
        }
      }
    }

    const specificity = type === "*/*" ? 0 : type.endsWith("/*") ? 1 : 2;
    return { type, q, specificity };
  });
}

function matches(entry: AcceptEntry, candidate: ProducedContentType) {
  if (entry.type === "*/*") {
    return true;
  }

  if (entry.type.endsWith("/*")) {
    return candidate.startsWith(entry.type.slice(0, -1));
  }

  return entry.type === candidate;
}

export function preferredContentType(
  header: string | null,
): ProducedContentType | null {
  if (!header) {
    return PRODUCED_CONTENT_TYPES[0];
  }

  const entries = parseAccept(header);
  if (entries.length === 0) {
    return PRODUCED_CONTENT_TYPES[0];
  }

  let bestType: ProducedContentType | null = null;
  let bestQ = -1;
  let bestPosition = Number.POSITIVE_INFINITY;

  for (const candidate of PRODUCED_CONTENT_TYPES) {
    let matched: AcceptEntry | null = null;
    let matchedPosition = Number.POSITIVE_INFINITY;

    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index];
      if (!matches(entry, candidate)) {
        continue;
      }

      if (
        matched === null ||
        entry.specificity > matched.specificity ||
        (entry.specificity === matched.specificity && index < matchedPosition)
      ) {
        matched = entry;
        matchedPosition = index;
      }
    }

    if (matched === null || matched.q <= 0) {
      continue;
    }

    if (
      matched.q > bestQ ||
      (matched.q === bestQ && matchedPosition < bestPosition)
    ) {
      bestQ = matched.q;
      bestPosition = matchedPosition;
      bestType = candidate;
    }
  }

  return bestType;
}

export function appendVaryAccept(headers: Headers) {
  const existing = headers.get("Vary");
  if (!existing) {
    headers.set("Vary", "Accept");
    return;
  }

  const values = existing.split(",").map((value) => value.trim().toLowerCase());
  if (!values.includes("accept")) {
    headers.set("Vary", `${existing}, Accept`);
  }
}
