import { readFile } from "node:fs/promises";
import path from "node:path";

async function llmsResponse(request: Request) {
  const body = await readFile(
    path.join(process.cwd(), "app", "content", "llms.txt"),
    "utf8",
  );

  return new Response(request.method === "HEAD" ? null : body, {
    headers: {
      "Cache-Control":
        "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "text/markdown; charset=utf-8",
      Link: "</llms.txt>; rel=\"describedby\"",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(request: Request) {
  return llmsResponse(request);
}

export async function HEAD(request: Request) {
  return llmsResponse(request);
}
