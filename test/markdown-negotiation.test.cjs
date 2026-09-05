"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");
const vm = require("node:vm");

function loadMarkdownModule() {
  const sourcePath = path.join(__dirname, "..", "src", "lib", "markdown-negotiation.ts");
  const source = fs.readFileSync(sourcePath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const sandbox = { exports: {}, module: { exports: {} }, Response, Request, Headers };
  sandbox.module.exports = sandbox.exports;
  vm.runInNewContext(outputText, sandbox, { filename: sourcePath });
  return sandbox.module.exports;
}

const { htmlToMarkdown } = loadMarkdownModule();

test("htmlToMarkdown converts HTML tables to markdown tables", () => {
  const markdown = htmlToMarkdown(`
    <main>
      <h1>Pricing</h1>
      <table>
        <thead>
          <tr><th>Plan</th><th>Requests</th></tr>
        </thead>
        <tbody>
          <tr><td>Starter</td><td>1,000</td></tr>
          <tr><td>Pro</td><td>10,000</td></tr>
        </tbody>
      </table>
    </main>
  `);

  assert.match(markdown, /# Pricing/);
  assert.match(markdown, /\| Plan \| Requests \|/);
  assert.match(markdown, /\| --- \| --- \|/);
  assert.match(markdown, /\| Starter \| 1,000 \|/);
  assert.match(markdown, /\| Pro \| 10,000 \|/);
});

test("htmlToMarkdown creates synthetic headers when a table has only td cells", () => {
  const markdown = htmlToMarkdown(`
    <table>
      <tr><td>Metric</td><td>Value</td></tr>
      <tr><td>p50</td><td>0.014ms</td></tr>
      <tr><td>p99</td></tr>
    </table>
  `);

  assert.match(markdown, /\| Column 1 \| Column 2 \|/);
  assert.match(markdown, /\| Metric \| Value \|/);
  assert.match(markdown, /\| p50 \| 0.014ms \|/);
  assert.match(markdown, /\| p99 \|  \|/);
});

test("htmlToMarkdown escapes pipe characters inside table cells", () => {
  const markdown = htmlToMarkdown(`
    <table>
      <tr><th>Command</th><th>Description</th></tr>
      <tr><td>cat a | grep b</td><td>Filters &amp; prints</td></tr>
    </table>
  `);

  assert.ok(markdown.includes("| cat a \\| grep b | Filters & prints |"));
});

test("htmlToMarkdown preserves table-cell line breaks and escaped pipes", () => {
  const markdown = htmlToMarkdown(`
    <table>
      <tr><th>Value</th></tr>
      <tr><td>path \\| command<br>next line</td></tr>
    </table>
  `);

  assert.ok(markdown.includes(String.raw`| path \\\| command<br>next line |`));
});
