import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  canonicalAgentPath,
  markdownSiblingPath,
  readAgentContent,
} from "../app/lib/agentContent.ts";

const contentDirectory = path.join(process.cwd(), "app", "content");

test("maps canonical pages and explicit Markdown siblings to the same content", async () => {
  assert.equal(canonicalAgentPath("/index.md"), "/");
  assert.equal(canonicalAgentPath("/tos.md"), "/tos");
  assert.equal(markdownSiblingPath("/"), "/index.md");
  assert.equal(markdownSiblingPath("/tos"), "/tos.md");

  const home = await readAgentContent("/index.md");
  const tos = await readAgentContent("/tos");
  assert.equal(home.status, 200);
  assert.match(home.body, /^# Icarus Strats/m);
  assert.equal(tos.status, 200);
  assert.match(tos.body, /^# Terms of Service/m);
});

test("returns a recovery-oriented Markdown 404 for unknown paths", async () => {
  const result = await readAgentContent("/missing-page");
  assert.equal(result.status, 404);
  assert.match(result.body, /^# 404: Page not found/m);
  assert.match(result.body, /https:\/\/icarusstrats\.com\/llms\.txt/);
  assert.match(result.body, /https:\/\/icarusstrats\.com\/sitemap\.xml/);
});

test("homepage Markdown contains substantial structured product content", async () => {
  const home = await readFile(path.join(contentDirectory, "home.md"), "utf8");
  assert.ok(home.length >= 1_500, `expected at least 1500 characters, got ${home.length}`);
  assert.match(home, /^# Icarus Strats/m);
  assert.match(home, /^## When to use Icarus/m);
  assert.match(home, /^### Draw and annotate/m);
  assert.match(home, /not a hosted agent API/i);
});

test("llms.txt follows the required heading, summary, details, and file-list order", async () => {
  const llms = await readFile(path.join(contentDirectory, "llms.txt"), "utf8");
  const lines = llms.split("\n");

  assert.equal(lines[0], "# Icarus Strats");
  assert.equal(lines[1], "");
  assert.match(lines[2], /^> /);
  assert.match(llms, /^## When to use Icarus/m);
  assert.match(llms, /^## How agents should use Icarus/m);
  assert.match(llms, /not a hosted API/i);

  const h2Indexes = lines
    .map((line, index) => (line.startsWith("## ") ? index : -1))
    .filter((index) => index >= 0);

  for (let section = 0; section < h2Indexes.length; section += 1) {
    const start = h2Indexes[section] + 1;
    const end = h2Indexes[section + 1] ?? lines.length;
    const entries = lines.slice(start, end).filter(Boolean);
    assert.ok(entries.length > 0, `section at line ${start} must contain links`);
    assert.ok(
      entries.every((line) => /^- \[[^\]]+\]\(https?:\/\/[^)]+\)(?:: .+)?$/.test(line)),
      `section at line ${start} must contain only Markdown link-list entries`,
    );
  }
});
