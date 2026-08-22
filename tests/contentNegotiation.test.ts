import assert from "node:assert/strict";
import test from "node:test";

import {
  appendVaryAccept,
  preferredContentType,
} from "../app/lib/contentNegotiation.ts";

test("defaults to HTML when Accept is absent", () => {
  assert.equal(preferredContentType(null), "text/html");
});

test("serves Markdown when it is the client's preferred representation", () => {
  assert.equal(preferredContentType("text/markdown"), "text/markdown");
  assert.equal(
    preferredContentType("text/markdown, text/html;q=0.8"),
    "text/markdown",
  );
  assert.equal(
    preferredContentType("text/html;q=0.5, text/markdown;q=0.9"),
    "text/markdown",
  );
});

test("honors q-values, specificity, wildcards, and client order", () => {
  assert.equal(
    preferredContentType("text/html;q=0, */*;q=1"),
    "text/markdown",
  );
  assert.equal(preferredContentType("text/*"), "text/html");
  assert.equal(
    preferredContentType("text/markdown, text/html, */*"),
    "text/markdown",
  );
  assert.equal(
    preferredContentType("text/html, text/markdown, */*"),
    "text/html",
  );
});

test("returns null when no available representation is acceptable", () => {
  assert.equal(preferredContentType("application/pdf"), null);
  assert.equal(
    preferredContentType("text/html;q=0, text/markdown;q=0"),
    null,
  );
});

test("adds Accept to Vary without dropping or duplicating existing fields", () => {
  const headers = new Headers({ Vary: "RSC, Accept-Encoding" });
  appendVaryAccept(headers);
  assert.equal(headers.get("Vary"), "RSC, Accept-Encoding, Accept");

  appendVaryAccept(headers);
  assert.equal(headers.get("Vary"), "RSC, Accept-Encoding, Accept");
});
