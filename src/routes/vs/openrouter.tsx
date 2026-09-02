import { createFileRoute } from "@tanstack/react-router";
import { VsPage, type VsPageProps } from "@/components/vs/VsPage";

const data: VsPageProps = {
  competitor: {
    name: "OpenRouter",
    slug: "openrouter",
    tagline: "200+ model marketplace",
    url: "https://openrouter.ai",
    description:
      "OpenRouter is a managed gateway that gives you access to 200+ AI models through a single API. OpenRouter supports workspace provider keys and end-user OAuth/PKCE, so users can connect an OpenRouter account. You pay OpenRouter (or set up credit limits), and they handle routing, fallbacks, and usage tracking. Great for developers who want broad model access without managing multiple provider accounts.",
    bestFor: "Developers who want 200+ models, smart routing, and usage analytics through one managed API",
    primaryDiff:
      "OpenRouter lets users connect an OpenRouter account. byok-relay lets users connect their existing AI providers directly inside your product — no OR account, no gateway balance, billed straight to their provider.",
  },
  verdict: {
    headline: "Different tools. Different billing models. Different use cases.",
    useByok:
      "Your users already have AI credits (employer keys, startup programs, personal accounts) and you don't want to pay for their inference. BYOK removes the cost objection entirely.",
    useCompetitor:
      "You're paying for your users' AI and want access to 200+ models, smart routing, fallbacks, and usage analytics through a single managed API.",
  },
  rows: [
    {
      label: "Who pays for AI usage",
      byok: "Your users (their own keys)",
      competitor: "You (the developer)",
    },
    {
      label: "Direct first-party provider BYOK",
      byok: true,
      competitor: "Via OR account",
      note: "OpenRouter lets users connect an OpenRouter account. byok-relay connects their existing OpenAI/Anthropic/etc. account directly — no OR account required.",
    },
    {
      label: "Zero inference bill",
      byok: true,
      competitor: false,
    },
    {
      label: "Browser-safe (CORS handled)",
      byok: true,
      competitor: true,
    },
    {
      label: "Self-hosted",
      byok: true,
      competitor: false,
    },
    {
      label: "Open source",
      byok: "Apache 2.0",
      competitor: false,
    },
    {
      label: "Model routing / fallbacks",
      byok: false,
      competitor: "200+ models",
    },
    {
      label: "Usage analytics",
      byok: false,
      competitor: true,
    },
    {
      label: "Spend tracking / budgets",
      byok: false,
      competitor: true,
    },
    {
      label: "Vendor lock-in",
      byok: "None — self-host or managed",
      competitor: "Managed only",
    },
    {
      label: "Pricing",
      byok: "Free to self-host",
      competitor: "Usage-based markup",
    },
  ],
  faq: [
    {
      q: "Can I use OpenRouter as a provider inside byok-relay?",
      a: "Yes. byok-relay supports any OpenAI-compatible endpoint — you can point it at OpenRouter so your users bring their OpenRouter key, getting 200+ model access while you still pay nothing.",
    },
    {
      q: "When would I use both?",
      a: "If some users have their own provider keys and others don't, you can offer both paths: byok-relay for BYOK users, a direct OpenRouter integration for users without keys. They're complementary, not competing.",
    },
    {
      q: "Does OpenRouter support self-hosting?",
      a: "No. OpenRouter is a managed service. byok-relay is fully self-hostable — deploy to your own VPS, Railway, or Fly.io. Your users' keys never leave your infrastructure.",
    },
    {
      q: "What if I want model routing AND BYOK?",
      a: "byok-relay's roadmap includes unified model routing (model param selects provider automatically). For now, users bring per-provider keys and call the relevant provider endpoint. Unified routing coming in a future release.",
    },
  ],
};

export const Route = createFileRoute("/vs/openrouter")({
  head: () => ({
    meta: [
      { title: "byok-relay vs OpenRouter — BYOK vs Managed AI Gateway" },
      {
        name: "description",
        content:
          "byok-relay vs OpenRouter: comparing an open-source BYOK relay (users bring their own keys, zero inference bill) with OpenRouter's managed 200+ model marketplace. Find the right tool for your use case.",
      },
      {
        property: "og:title",
        content: "byok-relay vs OpenRouter — BYOK vs Managed AI Gateway",
      },
      {
        property: "og:description",
        content:
          "OpenRouter bills you for AI usage. byok-relay lets your users bring their own keys — so your inference bill stays zero.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <VsPage {...data} />,
});
