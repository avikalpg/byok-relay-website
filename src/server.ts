import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

// ── Markdown content negotiation ─────────────────────────────────────────────
// When a client sends `Accept: text/markdown` (AI agents, crawlers),
// we fetch the page as HTML, convert it at the edge, and return it
// with Content-Type: text/markdown.
//
// Uses a zero-dependency regex converter — no require(), no Node APIs —
// so it works in the Cloudflare Workers runtime without issue.
// (turndown was tried first but uses require() at init time, which
// the Workers runtime rejects at deploy with error code 10021.)

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
  return decodeEntities(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

/**
 * Minimal HTML → Markdown converter.
 * Regex-only, zero dependencies, safe for Cloudflare Workers.
 * Covers the patterns found in a TanStack Start marketing site.
 */
function htmlToMarkdown(html: string): string {
  return (
    html
      // — Remove entire elements agents don't need —
      .replace(/<(script|style|nav|footer|head)[^>]*>[\s\S]*?<\/\1>/gi, "")
      // — Headings —
      .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, c) => `\n# ${stripTags(c)}\n`)
      .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, c) => `\n## ${stripTags(c)}\n`)
      .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, c) => `\n### ${stripTags(c)}\n`)
      .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, c) => `\n#### ${stripTags(c)}\n`)
      .replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, (_, c) => `\n##### ${stripTags(c)}\n`)
      .replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, (_, c) => `\n###### ${stripTags(c)}\n`)
      // — Links —
      .replace(
        /<a[^>]+href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
        (_, href, text) => `[${stripTags(text)}](${href})`,
      )
      // — Inline formatting —
      .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_, _t, c) => `**${stripTags(c)}**`)
      .replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_, _t, c) => `_${stripTags(c)}_`)
      // — Code blocks before inline code —
      .replace(
        /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
        (_, c) => `\n\`\`\`\n${decodeEntities(c).trim()}\n\`\`\`\n`,
      )
      .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, c) => `\`${decodeEntities(c).trim()}\``)
      // — Lists —
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, c) => `- ${stripTags(c).trim()}\n`)
      .replace(/<\/(ul|ol)>/gi, "\n")
      // — Block elements → blank line —
      .replace(/<\/(p|div|section|article|main|header)>/gi, "\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<hr\s*\/?>/gi, "\n---\n")
      // — Strip remaining tags —
      .replace(/<[^>]+>/g, "")
      // — Decode any remaining entities —
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      // — Clean up whitespace —
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/** Rough token estimate: ~4 chars per token (GPT-family average). */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Returns true if the request explicitly prefers text/markdown over text/html.
 * Handles both `Accept: text/markdown` and quality-weighted forms like
 * `Accept: text/markdown, text/html;q=0.9`.
 */
function prefersMarkdown(request: Request): boolean {
  const accept = request.headers.get("accept") ?? "";
  // Quick path: header doesn't mention markdown at all
  if (!accept.includes("text/markdown")) return false;
  // Parse quality values to confirm markdown wins
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

async function serveAsMarkdown(
  request: Request,
  handler: ServerEntry,
  env: unknown,
  ctx: unknown,
): Promise<Response | null> {
  // Re-issue the request asking for HTML so TanStack Start renders normally
  const htmlHeaders = new Headers(request.headers);
  htmlHeaders.set("accept", "text/html");
  const htmlRequest = new Request(request, { headers: htmlHeaders });

  const htmlResponse = await handler.fetch(htmlRequest, env, ctx);

  // Only convert successful HTML responses
  const contentType = htmlResponse.headers.get("content-type") ?? "";
  if (!htmlResponse.ok || !contentType.includes("text/html")) {
    return null; // fall back to normal handling
  }

  const html = await htmlResponse.text();
  const markdown = htmlToMarkdown(html);
  const tokens = estimateTokens(markdown);

  return new Response(markdown, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "x-markdown-tokens": String(tokens),
      // Preserve cache hints from the original response
      ...(htmlResponse.headers.has("cache-control")
        ? { "cache-control": htmlResponse.headers.get("cache-control")! }
        : {}),
    },
  });
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();

      // Serve markdown when the client prefers it (AI agents, crawlers)
      if (prefersMarkdown(request)) {
        const mdResponse = await serveAsMarkdown(request, handler, env, ctx);
        if (mdResponse) return mdResponse;
        // If conversion failed (non-HTML page, error, etc.) fall through
      }

      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
