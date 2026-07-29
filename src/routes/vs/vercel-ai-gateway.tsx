import { createFileRoute } from "@tanstack/react-router";
import { VsPage, type VsPageProps } from "@/components/vs/VsPage";

const data: VsPageProps = {
  competitor: {
    name: "Vercel AI Gateway",
    slug: "vercel-ai-gateway",
    tagline: "Managed AI gateway for Vercel projects",
    url: "https://vercel.com/ai",
    description:
      "Vercel AI Gateway is a managed AI proxy integrated into the Vercel platform. It provides a unified endpoint across AI providers, with observability, caching, and fallback routing — all within Vercel's infrastructure. Launched May 2026, it targets developers already hosting on Vercel who want AI features without building a backend.",
    bestFor:
      "Vercel-hosted projects that want managed AI routing with observability and no backend setup",
    primaryDiff:
      "Vercel AI Gateway is managed, Vercel-only, and bills you for AI usage. byok-relay is self-hostable, platform-agnostic, and free — letting your users bring their own keys so your inference bill stays zero.",
  },
  verdict: {
    headline: "Managed and Vercel-tied vs open-source and self-hostable.",
    useByok:
      "Your users have their own AI credits and you want zero inference costs. Or you're not on Vercel, or you don't want vendor lock-in to a hosting platform.",
    useCompetitor:
      "You're already on Vercel, you pay for your users' AI, and you want AI routing + observability integrated into your existing deployment with minimal setup.",
  },
  rows: [
    {
      label: "Who pays for AI usage",
      byok: "Your users (their own keys)",
      competitor: "You (the developer)",
    },
    {
      label: "BYOK for end-users",
      byok: true,
      competitor: false,
      note: "Can end-users plug in their own API key?",
    },
    {
      label: "Zero inference bill",
      byok: true,
      competitor: false,
    },
    {
      label: "Self-hosted",
      byok: true,
      competitor: false,
      note: "Vercel AI Gateway is managed; no self-host option",
    },
    {
      label: "Open source",
      byok: "Apache 2.0",
      competitor: false,
    },
    {
      label: "Platform lock-in",
      byok: "None — deploy anywhere",
      competitor: "Vercel only",
    },
    {
      label: "Multi-provider routing",
      byok: "warn",
      competitor: true,
      note: "byok-relay: per-provider endpoints today; unified routing on roadmap",
    },
    {
      label: "Observability / analytics",
      byok: false,
      competitor: true,
    },
    {
      label: "Response caching",
      byok: false,
      competitor: true,
    },
    {
      label: "Browser-safe (CORS handled)",
      byok: true,
      competitor: true,
    },
    {
      label: "Encrypted key storage",
      byok: "AES-256-GCM",
      competitor: "Keys held by Vercel",
    },
    {
      label: "Works outside Vercel",
      byok: true,
      competitor: false,
    },
    {
      label: "Pricing",
      byok: "Free to self-host",
      competitor: "Usage-based (Vercel pricing)",
    },
  ],
  faq: [
    {
      q: "Is Vercel AI Gateway open source?",
      a: "No. It's a proprietary managed service built into Vercel's platform. byok-relay is Apache 2.0 open-source — you can read the code, fork it, and self-host.",
    },
    {
      q: "Can I use byok-relay on Vercel?",
      a: "Yes, but with a caveat: Vercel serverless functions have an ephemeral filesystem, so SQLite data won't persist between cold starts. For production on Vercel, use Railway or Fly.io instead — or connect byok-relay to a managed PostgreSQL database.",
    },
    {
      q: "Does Vercel AI Gateway support BYOK for end-users?",
      a: "No. Vercel AI Gateway uses your (the developer's) API keys stored in Vercel environment variables. End-users can't bring their own provider keys.",
    },
    {
      q: "What if I want to migrate away from Vercel later?",
      a: "byok-relay is platform-agnostic — deploy to any VPS, Docker, Railway, or Fly.io. No lock-in. Vercel AI Gateway is tied to Vercel's infrastructure.",
    },
  ],
};

export const Route = createFileRoute("/vs/vercel-ai-gateway")({
  head: () => ({
    meta: [
      {
        title: "byok-relay vs Vercel AI Gateway — Open-Source BYOK vs Managed AI Proxy",
      },
      {
        name: "description",
        content:
          "byok-relay vs Vercel AI Gateway: open-source BYOK relay (users bring their own keys, self-hostable, free) vs Vercel's managed AI proxy (platform-tied, observability, usage-based pricing). Compare features and pick the right tool.",
      },
      {
        property: "og:title",
        content: "byok-relay vs Vercel AI Gateway — Open-Source BYOK vs Managed AI Proxy",
      },
      {
        property: "og:description",
        content:
          "Vercel AI Gateway is managed and Vercel-only. byok-relay is open-source, self-hostable, and lets your users bring their own keys.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <VsPage {...data} />,
});
