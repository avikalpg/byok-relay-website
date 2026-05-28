import { createFileRoute } from "@tanstack/react-router";
import { Benchmarks } from "@/components/benchmarks/Benchmarks";

export const Route = createFileRoute("/benchmarks")({
  head: () => ({
    meta: [
      { title: "Benchmarks — byok-relay" },
      {
        name: "description",
        content:
          "Real measured latency overhead of routing through byok-relay: p50=0.014ms, p99=0.041ms CPU overhead. Methodology transparent and reproducible.",
      },
      { property: "og:title", content: "byok-relay Benchmarks — relay overhead is <0.05ms" },
      {
        property: "og:description",
        content:
          "We measured the relay's internal processing overhead (HMAC + SQLite + AES-GCM): p99 is 41 microseconds. The network hop to the AI provider dominates, not the relay.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Benchmarks,
});
