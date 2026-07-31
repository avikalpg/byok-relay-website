import assert from "node:assert/strict";
import { htmlToMarkdown } from "../src/lib/markdown-negotiation.ts";

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
