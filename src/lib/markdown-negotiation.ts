/**
 * markdown-negotiation.ts
 *
 * Content negotiation for `Accept: text/markdown` requests.
 * Used by the Cloudflare Worker entry point (src/server.ts) to serve
 * markdown to AI agents without changing the default HTML behaviour for browsers.
 *
 * All helpers are pure functions with no dependencies — no require(), no Node
 * APIs — so they are safe to run in the Cloudflare Workers runtime.
 */

// ── HTML → Markdown conversion ───────────────────────────────────────────────

/** Decode common HTML entities. */
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/** Strip all HTML tags from a string and decode entities. */
function stripTags(html: string): string {
  return decodeEntities(
    html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function getHtmlAttribute(tag: string, name: string): string | null {
  for (const match of tag.matchAll(/\s+([^\s=/>]+)\s*(?:=\s*("([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    if (match[1].toLowerCase() !== name.toLowerCase()) continue;
    return decodeEntities(match[3] ?? match[4] ?? match[5] ?? "").trim();
  }
  return null;
}

function escapeMarkdownImageAlt(alt: string): string {
  return alt
    .replace(/[[\]\\]/g, "\\$&")
    .replace(/\s+/g, " ")
    .trim();
}

function imageTagToMarkdown(tag: string): string {
  const src = getHtmlAttribute(tag, "src");
  const alt = getHtmlAttribute(tag, "alt");

  // Images without useful alt text add noise to agent-facing markdown, so keep
  // the prior behaviour for decorative images while preserving meaningful ones.
  if (!src || !alt) return "";
  return `![${escapeMarkdownImageAlt(alt)}](${src})\n`;
}

function findClosingTag(html: string, openTagEnd: number, tag: string): number | null {
  const tags = new RegExp(`<\\/?${tag}\\b[^>]*>`, "gi");
  tags.lastIndex = openTagEnd;
  let depth = 1;

  for (const match of html.matchAll(tags)) {
    if (match[0].startsWith("</")) depth -= 1;
    else depth += 1;
    if (depth === 0) return match.index! + match[0].length;
  }
  return null;
}

function directListItems(content: string): string[] {
  const items: string[] = [];
  const tags = /<\/?(?:ul|ol|li)\b[^>]*>/gi;
  let listDepth = 0;
  let itemStart: number | null = null;

  for (const match of content.matchAll(tags)) {
    const token = match[0].toLowerCase();
    const isClosing = token.startsWith("</");
    const tag = token.match(/^<\/?(ul|ol|li)\b/)?.[1];
    if (!tag) continue;

    if (tag === "ul" || tag === "ol") {
      listDepth += isClosing ? -1 : 1;
      continue;
    }

    if (listDepth !== 0) continue;
    if (!isClosing) itemStart = match.index! + match[0].length;
    else if (itemStart !== null) {
      items.push(content.slice(itemStart, match.index));
      itemStart = null;
    }
  }

  return items;
}

function listItemToMarkdown(item: string, nestedIndent: string): string {
  const nestedList = /<(ul|ol)\b[^>]*>/i.exec(item);
  const text = stripTags(nestedList ? item.slice(0, nestedList.index) : item).trim();
  const nested = nestedList ? convertListBlock(item.slice(nestedList.index!), nestedIndent) : "";
  return [text, nested].filter(Boolean).join("\n");
}

function convertListBlock(html: string, indent = ""): string {
  const open = /<(ul|ol)\b[^>]*>/i.exec(html);
  if (!open) return "";
  const tag = open[1].toLowerCase();
  const openTagEnd = open.index! + open[0].length;
  const closingTagEnd = findClosingTag(html, openTagEnd, tag);
  if (closingTagEnd === null) return stripTags(html);

  const closingStart = html.lastIndexOf("</", closingTagEnd);
  let index = 0;
  const lines = directListItems(html.slice(openTagEnd, closingStart)).flatMap((item) => {
    index += 1;
    const marker = `${tag === "ol" ? `${index}.` : "-"} `;
    const text = listItemToMarkdown(item, " ".repeat(indent.length + marker.length));
    if (!text) return [];
    return `${indent}${marker}${text}`;
  });

  return lines.join("\n");
}

/** Convert complete HTML list blocks to markdown while preserving nested hierarchy. */
function convertLists(html: string): string {
  let result = "";
  let cursor = 0;
  const listOpen = /<(ul|ol)\b[^>]*>/gi;

  for (const match of html.matchAll(listOpen)) {
    if (match.index! < cursor) continue;
    const tag = match[1].toLowerCase();
    const openTagEnd = match.index! + match[0].length;
    const closingTagEnd = findClosingTag(html, openTagEnd, tag);
    if (closingTagEnd === null) continue;

    result += html.slice(cursor, match.index);
    result += `\n${convertListBlock(html.slice(match.index, closingTagEnd))}\n`;
    cursor = closingTagEnd;
  }

  return result + html.slice(cursor);
}

/**
 * Minimal HTML → Markdown converter.
 * Regex-only, zero dependencies, safe for Cloudflare Workers.
 * Covers the common patterns found in a TanStack Start marketing site.
 *
 * Known limitations (tracked as GitHub issues):
 *   - <table> content is stripped to plain text
 */
export function htmlToMarkdown(html: string): string {
  const markdownWithConvertedInlineElements = html
    // ── Remove entire elements agents don't need ──
    .replace(/<(script|style|nav|footer|head)[^>]*>[\s\S]*?<\/\1>/gi, "")
    // ── Images ── (before headings or generic tag stripping)
    .replace(/<img\b[^>]*\/?>/gi, (tag) => imageTagToMarkdown(tag))
    // ── Headings ──
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, c) => `\n# ${stripTags(c)}\n`)
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, c) => `\n## ${stripTags(c)}\n`)
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, c) => `\n### ${stripTags(c)}\n`)
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, c) => `\n#### ${stripTags(c)}\n`)
    .replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, (_, c) => `\n##### ${stripTags(c)}\n`)
    .replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, (_, c) => `\n###### ${stripTags(c)}\n`)
    // ── Links ── (React always quotes attributes, so single/double quotes suffice)
    .replace(
      /<a[^>]+href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
      (_, href, text) => `[${stripTags(text)}](${href})`,
    )
    // ── Inline formatting ──
    .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_, _t, c) => `**${stripTags(c)}**`)
    .replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_, _t, c) => `_${stripTags(c)}_`)
    // ── Code blocks (before inline code) ──
    .replace(
      /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
      (_, c) => `\n\`\`\`\n${decodeEntities(c).trim()}\n\`\`\`\n`,
    )
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, c) => `\`${decodeEntities(c).trim()}\``);

  return (
    convertLists(markdownWithConvertedInlineElements)
      // ── Lists ──
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, c) => `- ${stripTags(c).trim()}\n`)
      .replace(/<\/(ul|ol)>/gi, "\n")
      // ── Block elements → blank line ──
      .replace(/<\/(p|div|section|article|main|header)>/gi, "\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<hr\s*\/?>/gi, "\n---\n")
      // ── Strip remaining tags ──
      .replace(/<[^>]+>/g, "")
      // ── Decode any remaining entities ──
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      // ── Clean up whitespace ──
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/** Rough token estimate: ~4 chars per token (GPT-family average). */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// ── Accept header parsing ─────────────────────────────────────────────────────

/**
 * Returns true if the request explicitly prefers text/markdown over text/html.
 * Handles quality-weighted Accept headers, e.g.:
 *   Accept: text/markdown, text/html;q=0.9   → true
 *   Accept: text/html, text/markdown;q=0.5   → false
 *   Accept: text/markdown                     → true (markdown wins on equal quality —
 *                                               intentional: prefer richer agent output
 *                                               when a client advertises both without preference)
 */
export function prefersMarkdown(request: Request): boolean {
  const accept = request.headers.get("accept") ?? "";
  if (!accept.includes("text/markdown")) return false;

  const types = accept.split(",").map((part) => {
    const [type, ...params] = part.trim().split(";");
    const qParam = params.find((p) => p.trim().startsWith("q="));
    const q = qParam ? parseFloat(qParam.split("=")[1] ?? "1") : 1;
    return { type: type.trim(), q: isNaN(q) ? 1 : q };
  });

  const mdQ = types.find((t) => t.type === "text/markdown")?.q ?? 0;
  const htmlQ = types.find((t) => t.type === "text/html" || t.type === "*/*")?.q ?? 0;
  return mdQ >= htmlQ;
}

// ── Security headers to forward ───────────────────────────────────────────────

/** Headers from the HTML response that should be preserved on the markdown response. */
const FORWARD_HEADERS = [
  "strict-transport-security",
  "x-frame-options",
  "x-content-type-options",
  "content-security-policy",
  "access-control-allow-origin",
  "access-control-allow-credentials",
  "cache-control",
] as const;

// ── Main entry point ──────────────────────────────────────────────────────────

type FetchHandler = {
  fetch: (req: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

/**
 * Attempt to serve a markdown response for the given request.
 *
 * Re-issues the request with `Accept: text/html` so the SSR handler renders
 * normally, then converts the HTML to markdown and returns it with the
 * appropriate content-type headers.
 *
 * Returns null if the page isn't an HTML response (API routes, 404s, errors),
 * in which case the caller should fall back to normal handling.
 */
export async function serveAsMarkdown(
  request: Request,
  handler: FetchHandler,
  env: unknown,
  ctx: unknown,
): Promise<Response | null> {
  // Strip Accept header so TanStack Start sees a plain HTML request
  const htmlHeaders = new Headers(request.headers);
  htmlHeaders.set("accept", "text/html");
  const htmlRequest = new Request(request, { headers: htmlHeaders });

  const htmlResponse = await handler.fetch(htmlRequest, env, ctx);

  // Only convert successful HTML responses
  const contentType = htmlResponse.headers.get("content-type") ?? "";
  if (!htmlResponse.ok || !contentType.includes("text/html")) {
    return null;
  }

  const html = await htmlResponse.text();
  const markdown = htmlToMarkdown(html);
  const tokens = estimateTokens(markdown);

  // Forward a safe subset of security/cache headers from the HTML response
  const forwarded: Record<string, string> = {};
  for (const h of FORWARD_HEADERS) {
    const v = htmlResponse.headers.get(h);
    if (v) forwarded[h] = v;
  }

  return new Response(markdown, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "x-markdown-tokens": String(tokens),
      // Vary: Accept tells caches that the response differs by Accept header,
      // preventing markdown from being served to browser requests (or vice versa).
      vary: "Accept",
      ...forwarded,
    },
  });
}
