import "./lib/error-capture";

import TurndownService from "turndown";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

// ── Markdown content negotiation ─────────────────────────────────────────────
// When a client sends `Accept: text/markdown` (AI agents, crawlers),
// we fetch the page as HTML, convert it to markdown at the edge, and
// return it with Content-Type: text/markdown.
// This mirrors Cloudflare's "Markdown for Agents" zone feature, which
// is not yet available via API or on the current plan.

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

// Strip nav / footer / script / style noise — agents don't need it
turndown.remove(["script", "style", "nav", "footer", "head"]);

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
  const markdown = turndown.turndown(html);
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
