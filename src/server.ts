import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { prefersMarkdown, serveAsMarkdown } from "./lib/markdown-negotiation";

// RFC 8288 Link headers injected on every HTML response so agents can
// discover machine-readable resources without parsing the page.
// rel="describedby"  → llms.txt  (machine-readable service description)
// rel="service-doc"  → /skill    (agent skill / how-to-use documentation)
// rel="api-catalog"  → RFC 9727 JSON catalog of the relay API endpoints
const AGENT_DISCOVERY_LINK_HEADER =
  '</llms.txt>; rel="describedby", ' +
  '</skill>; rel="service-doc", ' +
  '</.well-known/api-catalog>; rel="api-catalog", ' +
  '</.well-known/agent-card.json>; rel="https://a2a-protocol.org/agent-card", ' +
  '</.well-known/agent-skills/index.json>; rel="https://agentskills.io/index"';

/**
 * Fix Content-Type for static well-known files that have no extension.
 * Cloudflare Workers serves extension-less files without a Content-Type;
 * RFC 9727 requires /.well-known/api-catalog to return application/linkset+json.
 */
function withWellKnownContentType(request: Request, response: Response): Response {
  const url = new URL(request.url);

  if ((url.pathname === "/skill" || url.pathname === "/skill.md") && response.status === 200) {
    const ct = response.headers.get("content-type") ?? "";
    if (!ct.includes("text/markdown")) {
      const headers = new Headers(response.headers);
      headers.set("content-type", "text/markdown; charset=utf-8");
      return new Response(response.body, { status: response.status, headers });
    }
  }

  if (url.pathname === "/llms.txt" && response.status === 200) {
    const ct = response.headers.get("content-type") ?? "";
    if (!ct.includes("text/plain")) {
      const headers = new Headers(response.headers);
      headers.set("content-type", "text/plain; charset=utf-8");
      return new Response(response.body, { status: response.status, headers });
    }
  }

  if (url.pathname === "/.well-known/api-catalog" && response.status === 200) {
    const ct = response.headers.get("content-type") ?? "";
    if (!ct.includes("application/linkset+json")) {
      const headers = new Headers(response.headers);
      headers.set("content-type", "application/linkset+json");
      return new Response(response.body, { status: response.status, headers });
    }
  }
  return response;
}

/** Attach agent-discovery Link headers to any HTML response. */
function withLinkHeaders(response: Response): Response {
  const ct = response.headers.get("content-type") ?? "";
  if (!ct.includes("text/html")) return response;
  const headers = new Headers(response.headers);
  // append, not set — preserves any pre-existing Link headers (preload hints etc.)
  headers.append("link", AGENT_DISCOVERY_LINK_HEADER);
  return new Response(response.body, { status: response.status, headers });
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry),
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
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return withLinkHeaders(withWellKnownContentType(request, normalized));
    } catch (error) {
      console.error(error);
      return withLinkHeaders(brandedErrorResponse());
    }
  },
};
