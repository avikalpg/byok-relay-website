import { createFileRoute } from "@tanstack/react-router";
import { VsPage, type VsPageProps } from "@/components/vs/VsPage";

const data: VsPageProps = {
  competitor: {
    name: "LiteLLM",
    slug: "litellm",
    tagline: "Unified LLM proxy for teams",
    url: "https://litellm.ai",
    description:
      "LiteLLM is a self-hosted proxy that gives teams a unified OpenAI-compatible endpoint across 100+ providers. It manages the org's API keys centrally — admins store keys, employees use a team token. Strong on observability, budget controls, and model routing. Built for engineering teams managing shared AI spend.",
    bestFor: "Engineering teams centralising org API keys with usage tracking and budget controls",
    primaryDiff:
      "LiteLLM manages your organisation's API keys so your team can use them. byok-relay goes the other direction — it lets your product's end-users bring their own personal or company keys, so you never pay for their AI.",
  },
  verdict: {
    headline: "Same self-hosted category, opposite key-ownership model.",
    useByok:
      "You're building a product where end-users bring their own AI keys. You don't want to manage anyone's API costs — each user pays their own provider directly.",
    useCompetitor:
      "You're an engineering team that wants a self-hosted proxy to centralise your org's API keys, enforce budget limits, and log all AI usage across teammates.",
  },
  rows: [
    {
      label: "Who owns the API keys",
      byok: "Your end-users (each brings their own)",
      competitor: "Your organisation (admin-managed)",
    },
    {
      label: "BYOK for end-users",
      byok: true,
      competitor: false,
      note: "End-users can plug in their own personal/company key",
    },
    {
      label: "Zero inference bill for you",
      byok: true,
      competitor: false,
      note: "With byok-relay, each user pays their own provider",
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
      note: "LiteLLM is server-to-server; CORS needs custom config",
    },
    {
      label: "Unified model routing",
      byok: false,
      competitor: "100+ providers",
    },
    {
      label: "Usage analytics per user",
      byok: false,
      competitor: true,
    },
    {
      label: "Budget controls / spend limits",
      byok: false,
      competitor: true,
    },
    {
      label: "Team / workspace model",
      byok: false,
      competitor: true,
    },
    {
      label: "Setup complexity",
      byok: "Low (single Node.js process)",
      competitor: "Medium (Python service + Redis + DB)",
    },
    {
      label: "Pricing",
      byok: "Free to self-host",
      competitor: "Open source + paid enterprise tier",
    },
  ],
  faq: [
    {
      q: "Can byok-relay and LiteLLM work together?",
      a: "Yes. LiteLLM exposes an OpenAI-compatible endpoint. Users could bring a LiteLLM team token through byok-relay — effectively combining self-hosted key management with end-user BYOK. Uncommon, but possible.",
    },
    {
      q: "Which is easier to self-host?",
      a: "byok-relay is simpler: a single Node.js process with SQLite, deployable via npx or docker-compose. LiteLLM typically needs Python, Redis for rate limiting, and a database. byok-relay is the lighter dependency.",
    },
    {
      q: "Does LiteLLM support end-user BYOK?",
      a: "LiteLLM's model is that the organisation holds the keys. End-users authenticate with a team token, not their own provider key. byok-relay inverts this — each user stores their own key, and you never hold it.",
    },
    {
      q: "I need budget controls. Should I use LiteLLM?",
      a: "Yes — if budget limits and per-user spend tracking are important, LiteLLM is the better fit today. byok-relay's observability roadmap is planned but not yet shipped.",
    },
  ],
};

export const Route = createFileRoute("/vs/litellm")({
  head: () => ({
    meta: [
      { title: "byok-relay vs LiteLLM — End-User BYOK vs Team Key Proxy" },
      {
        name: "description",
        content:
          "byok-relay vs LiteLLM: two self-hosted AI proxies with opposite key-ownership models. LiteLLM centralises org keys for teams; byok-relay lets your end-users bring their own keys. Compare features, setup, and use cases.",
      },
      {
        property: "og:title",
        content: "byok-relay vs LiteLLM — End-User BYOK vs Team Key Proxy",
      },
      {
        property: "og:description",
        content:
          "LiteLLM manages your org's API keys for your team. byok-relay lets your product's end-users bring their own keys — zero inference bill for you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <VsPage {...data} />,
});
