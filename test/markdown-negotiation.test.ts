import assert from "node:assert/strict";
import {
  htmlToMarkdown,
  prefersMarkdown,
  estimateTokens,
} from "../src/lib/markdown-negotiation.ts";

const converted = htmlToMarkdown(`
  <main>
    <h1>Image support</h1>
    <img alt="Benchmark chart" src="/benchmarks/chart.png" />
    <img src="https://cdn.example.com/og.png" alt="OpenGraph preview &amp; hero" />
    <img alt="" src="/decorative.png" />
    <img src="/missing-alt.png" />
  </main>
`);

assert.match(converted, /# Image support/);
assert.match(converted, /!\[Benchmark chart\]\(\/benchmarks\/chart\.png\)/);
assert.match(converted, /!\[OpenGraph preview & hero\]\(https:\/\/cdn\.example\.com\/og\.png\)/);
assert.doesNotMatch(converted, /decorative\.png/);
assert.doesNotMatch(converted, /missing-alt\.png/);

const escapedAlt = htmlToMarkdown('<img src="/brackets.png" alt="Chart [p99] \\ view" />');
assert.equal(escapedAlt, "![Chart \\[p99\\] \\\\ view](/brackets.png)");

const exactAttributeNames = htmlToMarkdown(
  '<img data-src="/lazy.png" alt="show src=/fake.png" src="/real.png" />',
);
assert.equal(exactAttributeNames, "![show src=/fake.png](/real.png)");

const headingImage = htmlToMarkdown('<h1><img alt="Chart" src="/chart.png"></h1>');
assert.match(headingImage, /!\[Chart\]\(\/chart\.png\)/);

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

assert.equal(
  htmlToMarkdown(
    "<ol><li>Install the relay<ol><li>Create a token</li><li>Set the endpoint<ul><li>Keep the key client-side</li></ul></li></ol></li><li>Send a request</li></ol>",
  ),
  "1. Install the relay\n   1. Create a token\n   2. Set the endpoint\n      - Keep the key client-side\n2. Send a request",
);

assert.equal(
  htmlToMarkdown(
    "<ol><li>One</li><li>Two</li><li>Three</li><li>Four</li><li>Five</li><li>Six</li><li>Seven</li><li>Eight</li><li>Nine</li><li>Ten<ul><li>Nested under a two-digit marker</li></ul></li></ol>",
  ),
  "1. One\n2. Two\n3. Three\n4. Four\n5. Five\n6. Six\n7. Seven\n8. Eight\n9. Nine\n10. Ten\n    - Nested under a two-digit marker",
);

assert.equal(
  htmlToMarkdown(
    "<ul><li>Parent<ul><li>Child</li></ul>Tail<ol><li>Later child</li></ol>End</li></ul>",
  ),
  "- Parent\n  - Child\n  Tail\n  1. Later child\n  End",
);

assert.equal(prefersMarkdown(requestWithAccept("text/markdown, text/html;q=0.9")), true);
assert.equal(prefersMarkdown(requestWithAccept("text/html, text/markdown;q=0.5")), false);
assert.equal(prefersMarkdown(requestWithAccept("text/html")), false);
assert.equal(estimateTokens("123456789"), 3);

console.log("markdown-negotiation tests passed");
