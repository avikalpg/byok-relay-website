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

/**
 * Minimal HTML → Markdown converter.
 * Regex-only, zero dependencies, safe for Cloudflare Workers.
 * Covers the common patterns found in a TanStack Start marketing site.
 *
 * Known limitations (tracked as GitHub issues):
 *   - <img> tags are stripped rather than converted to ![alt](src)
 *   - <ol> items render as unordered lists (stateful counter needed for 1. 2. 3.)
 *   - <table> content is stripped to plain text
 */
export function htmlToMarkdown(html: string): string {
  return (
    html
      // ── Remove entire elements agents don't need ──
      .replace(/<(script|style|nav|footer|head)[^>]*>[\s\S]*?<\/\1>/gi, "")
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
      .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, c) => `\`${decodeEntities(c).trim()}\``)
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
