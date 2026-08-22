import { readFile } from "node:fs/promises";
import path from "node:path";

const CONTENT_FILES = {
  "/": "home.md",
  "/tos": "tos.md",
} as const;

export type AgentContentPath = keyof typeof CONTENT_FILES;

function normalizePathname(pathname: string) {
  if (pathname === "/index.md") {
    return "/";
  }

  const withoutMarkdownExtension = pathname.endsWith(".md")
    ? pathname.slice(0, -3)
    : pathname;

  if (withoutMarkdownExtension.length > 1 && withoutMarkdownExtension.endsWith("/")) {
    return withoutMarkdownExtension.slice(0, -1);
  }

  return withoutMarkdownExtension || "/";
}

export function canonicalAgentPath(pathname: string) {
  return normalizePathname(pathname);
}

export function markdownSiblingPath(pathname: string) {
  const canonicalPath = normalizePathname(pathname);
  return canonicalPath === "/" ? "/index.md" : `${canonicalPath}.md`;
}

export function hasAgentContent(pathname: string) {
  return Object.hasOwn(CONTENT_FILES, normalizePathname(pathname));
}

async function readContentFile(filename: string) {
  return readFile(path.join(process.cwd(), "app", "content", filename), "utf8");
}

export async function readAgentContent(pathname: string) {
  const canonicalPath = normalizePathname(pathname);
  const filename = CONTENT_FILES[canonicalPath as AgentContentPath];

  if (!filename) {
    return {
      body: await readContentFile("not-found.md"),
      canonicalPath,
      status: 404,
    } as const;
  }

  return {
    body: await readContentFile(filename),
    canonicalPath,
    status: 200,
  } as const;
}
