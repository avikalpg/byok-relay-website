import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/landing/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "byok-relay — Let your users bring their own AI keys" },
      {
        name: "description",
        content:
          "Open-source relay that lets your app's users plug in their own OpenAI, Anthropic or Gemini keys. No CORS. No exposed keys. No inference bill.",
      },
      { property: "og:title", content: "byok-relay — Bring-your-own-key relay for AI apps" },
      {
        property: "og:description",
        content:
          "Stop losing users who already have AI credits. Self-hostable relay so your users bring their own keys.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});
