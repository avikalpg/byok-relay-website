import assert from "node:assert/strict";
import {
  htmlToMarkdown,
  prefersMarkdown,
  estimateTokens,
} from "../src/lib/markdown-negotiation.ts";

function requestWithAccept(accept: string): Request {
  return new Request("https://byokrelay.com/", { headers: { accept } });
}

assert.equal(
  htmlToMarkdown("<h1>BYOK Relay</h1><p>Use <strong>your</strong> key.</p>"),
  "# BYOK Relay\nUse **your** key.",
);

assert.equal(
  htmlToMarkdown(
    "<p>Steps</p><ol><li>Create an app</li><li>Store a key</li><li>Call <code>/relay</code></li></ol>",
  ),
  "Steps\n\n1. Create an app\n2. Store a key\n3. Call `/relay`",
);

assert.equal(
  htmlToMarkdown(
    '<ol><li>First &amp; safest</li><li><a href="/docs">Read docs</a></li></ol><ol><li>Reset counter</li></ol>',
  ),
  "1. First & safest\n2. [Read docs](/docs)\n\n1. Reset counter",
);

assert.equal(
  htmlToMarkdown("<ul><li>Browser-safe</li><li>Self-hosted</li></ul>"),
  "- Browser-safe\n- Self-hosted",
);

assert.equal(prefersMarkdown(requestWithAccept("text/markdown, text/html;q=0.9")), true);
assert.equal(prefersMarkdown(requestWithAccept("text/html, text/markdown;q=0.5")), false);
assert.equal(prefersMarkdown(requestWithAccept("text/html")), false);
assert.equal(estimateTokens("123456789"), 3);

console.log("markdown-negotiation tests passed");
