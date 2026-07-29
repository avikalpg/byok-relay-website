import { createFileRoute } from "@tanstack/react-router";
import { VsPage, type VsPageProps } from "@/components/vs/VsPage";

const data: VsPageProps = {
  competitor: {
    name: "Helicone",
    slug: "helicone",
    tagline: "AI observability platform",
    url: "https://helicone.ai",
    description:
      "Helicone is an AI observability and analytics platform. Route requests through Helicone's proxy to get request logging, cost tracking, caching, rate limiting, and dashboards — all without changing your provider. It's primarily an analytics layer on top of your existing AI setup, not a BYOK solution.",
    bestFor: "Teams that need observability, cost tracking, and caching on top of their AI spend",
    primaryDiff:
      "Helicone adds visibility to your AI calls — logs, costs, caching. byok-relay adds a different primitive entirely: letting your users bring their own keys so you never pay for their inference in the first place.",
  },
  verdict: {
    headline: "Observability layer vs BYOK relay — complementary problems.",
    useByok:
      "Your users already have AI credits and you want to stop paying for their inference. BYOK makes the cost model sustainable — each user pays their own provider.",
    useCompetitor:
      "You're paying for your users' AI and need deep visibility into usage, costs, caching efficiency, and latency. Helicone adds analytics without touching your prompts.",
  },
  rows: [
    {
      label: "Primary purpose",
      byok: "BYOK relay — users bring their own keys",
      competitor: "Observability — log, track, cache AI calls",
    },
    {
      label: "Who pays for AI usage",
      byok: "Your users (their own keys)",
      competitor: "You (the developer)",
    },
    {
      label: "BYOK for end-users",
      byok: true,
      competitor: false,
    },
    {
      label: "Zero inference bill",
      byok: true,
      competitor: false,
    },
    {
      label: "Request logging",
      byok: false,
      competitor: true,
    },
    {
      label: "Cost tracking per user",
      byok: false,
      competitor: true,
    },
    {
      label: "Response caching",
      byok: false,
      competitor: true,
    },
    {
      label: "Rate limiting",
      byok: "Basic (100 req/min)",
      competitor: "Advanced (per-user, configurable)",
    },
    {
      label: "Self-hosted",
      byok: true,
      competitor: true,
    },
    {
      label: "Open source",
      byok: "Apache 2.0",
      competitor: "MIT",
    },
    {
      label: "Browser-safe (CORS handled)",
      byok: true,
      competitor: "warn",
      note: "Helicone is a server-side proxy; CORS requires your own backend",
    },
    {
      label: "Setup complexity",
      byok: "Low",
      competitor: "Low (change base URL, add API key header)",
    },
  ],
  faq: [
    {
      q: "Can I use Helicone and byok-relay together?",
      a: "Yes — they solve different problems. byok-relay handles BYOK (users bring their own keys). Helicone handles observability. You could run byok-relay on top of Helicone-proxied endpoints to get BYOK + logging simultaneously.",
    },
    {
      q: "Why does Helicone win deals over OpenRouter?",
      a: "Helicone wins on observability — teams that pay for AI want to see where the money goes. byok-relay sidesteps that entirely: if your users pay, you don't need cost tracking for them.",
    },
    {
      q: "Does Helicone support self-hosting?",
      a: "Yes, Helicone has a self-hosted option. It's more complex than byok-relay (requires more infrastructure). byok-relay is a single Node.js process + SQLite.",
    },
    {
      q: "I want both BYOK and analytics. What do I do?",
      a: "byok-relay's roadmap includes a GET /stats endpoint and structured logging. In the meantime, you can log relay requests server-side alongside Helicone-proxied calls depending on your architecture.",
    },
  ],
};

export const Route = createFileRoute("/vs/helicone")({
  head: () => ({
    meta: [
      { title: "byok-relay vs Helicone — BYOK Relay vs AI Observability" },
      {
        name: "description",
        content:
          "byok-relay vs Helicone: BYOK relay vs AI observability platform. byok-relay lets users bring their own API keys; Helicone adds logging, caching, and cost tracking to your AI calls. Compare and choose the right tool.",
      },
      {
        property: "og:title",
        content: "byok-relay vs Helicone — BYOK Relay vs AI Observability",
      },
      {
        property: "og:description",
        content:
          "Helicone adds visibility to your AI spend. byok-relay removes the spend — users bring their own keys.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <VsPage {...data} />,
});
