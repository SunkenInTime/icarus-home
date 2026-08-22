import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import test from "node:test";

const port = 34_000 + (process.pid % 1_000);
const origin = `http://127.0.0.1:${port}`;

function startServer() {
  const nextBinary = path.join(
    process.cwd(),
    "node_modules",
    "next",
    "dist",
    "bin",
    "next",
  );

  const server = spawn(process.execPath, [nextBinary, "start", "-p", String(port)], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";
  server.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });

  return { server, output: () => output };
}

async function waitForServer(output) {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(origin, { redirect: "manual" });
      if (response.status > 0) {
        return;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  throw new Error(`Next.js did not start in time.\n${output()}`);
}

function varyIncludesAccept(response) {
  return (response.headers.get("vary") ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .includes("accept");
}

function textWithoutJavaScript(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

test("public agent-ready endpoints behave correctly", async (t) => {
  const running = startServer();
  t.after(() => {
    running.server.kill("SIGTERM");
  });
  await waitForServer(running.output);

  await t.test("homepage sends substantial structured HTML without JavaScript", async () => {
    const response = await fetch(origin, {
      headers: { Accept: "text/html" },
    });
    const body = await response.text();
    const headings = [...body.matchAll(/<h([1-6])\b/gi)].map((match) => Number(match[1]));

    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html/);
    assert.ok(textWithoutJavaScript(body).length >= 500);
    assert.equal(headings.filter((level) => level === 1).length, 1);
    assert.ok(headings.includes(2));
    assert.ok(headings.includes(3));
    assert.match(body, /Icarus Strats/);
    assert.match(
      body,
      /rel="alternate" type="text\/markdown" href="https:\/\/icarusstrats\.com\/index\.md"/,
    );
    assert.match(response.headers.get("link") ?? "", /rel="describedby"/);
  });

  await t.test("canonical URLs negotiate Markdown and advertise cache variance", async () => {
    for (const pathname of ["/", "/tos"]) {
      const response = await fetch(`${origin}${pathname}`, {
        headers: { Accept: "text/markdown, text/html;q=0.8" },
      });
      const body = await response.text();

      assert.equal(response.status, 200);
      assert.match(
        response.headers.get("content-type") ?? "",
        /^text\/markdown;\s*charset=utf-8/i,
      );
      assert.ok(varyIncludesAccept(response));
      assert.match(body, /^# /);
    }
  });

  await t.test("explicit Markdown siblings work without an Accept header", async () => {
    const home = await fetch(`${origin}/index.md`);
    const tos = await fetch(`${origin}/tos.md`);

    assert.equal(home.status, 200);
    assert.equal(tos.status, 200);
    assert.match(home.headers.get("content-type") ?? "", /^text\/markdown/);
    assert.match(tos.headers.get("content-type") ?? "", /^text\/markdown/);
    assert.match(await home.text(), /^# Icarus Strats/m);
    assert.match(await tos.text(), /^# Terms of Service/m);
  });

  await t.test("unsupported document representations return 406", async () => {
    const response = await fetch(origin, {
      headers: { Accept: "application/pdf" },
    });

    assert.equal(response.status, 406);
    assert.ok(varyIncludesAccept(response));
  });

  await t.test("HTML and Markdown 404s return 404 with recovery links", async () => {
    const html = await fetch(`${origin}/some-path-that-does-not-exist`, {
      headers: { Accept: "text/html" },
    });
    const htmlBody = await html.text();
    assert.equal(html.status, 404);
    assert.match(htmlBody, /Agent instructions/);
    assert.match(htmlBody, /\/sitemap\.xml/);

    const markdown = await fetch(`${origin}/some-path-that-does-not-exist`, {
      headers: { Accept: "text/markdown" },
    });
    const markdownBody = await markdown.text();
    assert.equal(markdown.status, 404);
    assert.match(markdown.headers.get("content-type") ?? "", /^text\/markdown/);
    assert.ok(varyIncludesAccept(markdown));
    assert.match(markdownBody, /^# 404: Page not found/m);
    assert.match(markdownBody, /https:\/\/icarusstrats\.com\/llms\.txt/);
    assert.match(markdownBody, /https:\/\/icarusstrats\.com\/sitemap\.xml/);
  });

  await t.test("existing public previews and share redirects keep working", async () => {
    const previewPaths = [
      "/concepts",
      "/concepts/closer-to-the-sun",
      "/concepts/functional-love",
      "/concepts/living-board",
      "/concepts/scraps",
      "/concepts/thirty-seconds",
      "/hackathon",
    ];

    for (const pathname of previewPaths) {
      const response = await fetch(`${origin}${pathname}`, {
        headers: { Accept: "text/html" },
      });
      assert.equal(response.status, 200, pathname);
      assert.match(response.headers.get("content-type") ?? "", /^text\/html/, pathname);
    }

    const share = await fetch(`${origin}/share/readiness-test`, {
      redirect: "manual",
    });
    assert.equal(share.status, 302);
    assert.equal(share.headers.get("location"), "/?code=readiness-test");
  });

  await t.test("machine-readable discovery files are valid and reachable", async () => {
    const llms = await fetch(`${origin}/llms.txt`);
    const robots = await fetch(`${origin}/robots.txt`);
    const sitemap = await fetch(`${origin}/sitemap.xml`);
    const manifest = await fetch(`${origin}/manifest.webmanifest`);

    assert.equal(llms.status, 200);
    assert.match(llms.headers.get("content-type") ?? "", /^text\/markdown/);
    assert.match(await llms.text(), /^# Icarus Strats[\s\S]+## When to use Icarus/);

    assert.equal(robots.status, 200);
    assert.match(await robots.text(), /Sitemap: https:\/\/icarusstrats\.com\/sitemap\.xml/);

    assert.equal(sitemap.status, 200);
    const sitemapBody = await sitemap.text();
    assert.match(sitemapBody, /<loc>https:\/\/icarusstrats\.com\/<\/loc>/);
    assert.match(sitemapBody, /<loc>https:\/\/icarusstrats\.com\/tos<\/loc>/);

    assert.equal(manifest.status, 200);
    assert.equal((await manifest.json()).short_name, "Icarus Strats");
  });
});
