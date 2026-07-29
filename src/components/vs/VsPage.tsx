import { Check, X, AlertTriangle, Github, ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const GH_URL = "https://github.com/avikalpg/byok-relay";

export interface ComparisonRow {
  label: string;
  byok: boolean | "warn" | string;
  competitor: boolean | "warn" | string;
  note?: string;
}

export interface VsPageProps {
  competitor: {
    name: string;
    slug: string;
    tagline: string;
    url: string;
    description: string;
    bestFor: string;
    primaryDiff: string; // the key 1-line differentiation
  };
  verdict: {
    headline: string;
    useByok: string;
    useCompetitor: string;
  };
  rows: ComparisonRow[];
  faq: { q: string; a: string }[];
}

function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/android-chrome-192x192.png"
        alt="byok-relay logo"
        width="28"
        height="28"
        className="h-7 w-7"
      />
      <span className="font-mono text-[15px] font-medium tracking-tight">
        byok<span className="text-muted-foreground">-</span>relay
      </span>
    </div>
  );
}

function Header({ competitorName }: { competitorName: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          className="flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <Logo />
        </Link>
        <span className="hidden font-mono text-xs text-muted-foreground sm:block">
          vs {competitorName}
        </span>
        <a
          href={GH_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 font-mono text-xs hover:border-foreground/40 transition-colors"
        >
          <Github className="h-3.5 w-3.5" />
          <span>avikalpg/byok-relay</span>
        </a>
      </div>
    </header>
  );
}

function Cell({ v, highlight }: { v: boolean | "warn" | string; highlight?: boolean }) {
  const base = "px-5 py-4 text-sm align-top";
  const bg = highlight ? "bg-signal/[0.05]" : "";
  if (v === true)
    return (
      <td className={`${base} ${bg}`}>
        <div className="flex items-center gap-2 font-medium">
          <Check className="h-4 w-4 text-signal shrink-0" /> Yes
        </div>
      </td>
    );
  if (v === false)
    return (
      <td className={`${base} ${bg} text-muted-foreground`}>
        <div className="flex items-center gap-2">
          <X className="h-4 w-4 shrink-0" /> No
        </div>
      </td>
    );
  if (v === "warn")
    return (
      <td className={`${base} ${bg}`}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertTriangle className="h-4 w-4 shrink-0" /> Partial
        </div>
      </td>
    );
  return (
    <td className={`${base} ${bg} ${highlight ? "font-medium" : "text-muted-foreground"}`}>{v}</td>
  );
}

export function VsPage({ competitor, verdict, rows, faq }: VsPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header competitorName={competitor.name} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-paper opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] tracking-tight">
            <span className="h-1.5 w-1.5 rounded-full bg-signal signal-dot" />
            <span className="text-muted-foreground">
              Comparison · byok-relay vs {competitor.name}
            </span>
          </div>

          <h1 className="max-w-4xl text-balance text-4xl font-bold leading-[1.04] tracking-[-0.03em] md:text-6xl lg:text-[72px]">
            byok-relay <span className="text-muted-foreground">vs</span>{" "}
            <span className="font-display font-normal italic text-signal">{competitor.name}</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {competitor.primaryDiff}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-12 gap-2 px-5 text-sm">
              <Link to="/">
                Get started with byok-relay <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 gap-2 border-foreground/20 px-5 text-sm"
            >
              <a href={competitor.url} target="_blank" rel="noreferrer">
                Visit {competitor.name} →
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* TL;DR verdict */}
      <section className="border-b border-border bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-background/50">
            tl;dr
          </div>
          <h2 className="max-w-3xl text-3xl font-bold leading-[1.08] tracking-[-0.02em] md:text-4xl">
            {verdict.headline}
          </h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-background/10 bg-background/10 md:grid-cols-2">
            <div className="flex flex-col gap-4 bg-foreground p-7">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-signal">
                <Check className="h-3.5 w-3.5" /> use byok-relay when
              </div>
              <p className="text-base leading-relaxed text-background/80">{verdict.useByok}</p>
            </div>
            <div className="flex flex-col gap-4 bg-foreground p-7">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-background/50">
                <Check className="h-3.5 w-3.5" /> use {competitor.name} when
              </div>
              <p className="text-base leading-relaxed text-background/80">
                {verdict.useCompetitor}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="text-signal">01</span>
            <span className="h-px flex-1 bg-border max-w-16" />
            <span>feature comparison</span>
          </div>
          <h2 className="max-w-3xl text-3xl font-bold leading-[1.06] tracking-[-0.02em] md:text-4xl">
            Side-by-side.
          </h2>
          <div className="mt-12 overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-4 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground w-1/3">
                    Capability
                  </th>
                  <th className="bg-signal/[0.05] px-5 py-4 text-left w-1/3">
                    <div className="font-mono text-sm font-medium">byok-relay</div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-signal">
                      open-source
                    </div>
                  </th>
                  <th className="px-5 py-4 text-left w-1/3">
                    <div className="font-mono text-sm font-medium text-muted-foreground">
                      {competitor.name}
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                      {competitor.tagline}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.label}
                    className={i !== rows.length - 1 ? "border-b border-border" : ""}
                  >
                    <td className="px-5 py-4 text-sm font-medium">
                      {r.label}
                      {r.note && (
                        <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                          {r.note}
                        </div>
                      )}
                    </td>
                    <Cell v={r.byok} highlight />
                    <Cell v={r.competitor} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* About each tool */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="text-signal">02</span>
            <span className="h-px flex-1 bg-border max-w-16" />
            <span>what each tool is for</span>
          </div>
          <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
            <div className="flex flex-col gap-5 bg-card p-8 md:p-10">
              <Logo />
              <h3 className="text-2xl font-bold tracking-tight">byok-relay</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                An open-source relay that lets your app's users plug in their own AI API keys. Zero
                CORS friction. Zero inference bill for you. Keys stay encrypted server-side, never
                exposed to the browser. Self-host in minutes — single Node.js process + SQLite.
              </p>
              <div className="mt-auto pt-2">
                <span className="rounded-full border border-signal/30 bg-signal/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-signal">
                  Best for: {verdict.useByok.split(".")[0]}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-5 bg-card p-8 md:p-10">
              <div className="font-mono text-sm font-medium text-muted-foreground">
                {competitor.name}
              </div>
              <h3 className="text-2xl font-bold tracking-tight">{competitor.name}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {competitor.description}
              </p>
              <div className="mt-auto pt-2">
                <span className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Best for: {competitor.bestFor}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {faq.length > 0 && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
            <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="text-signal">03</span>
              <span className="h-px flex-1 bg-border max-w-16" />
              <span>common questions</span>
            </div>
            <div className="grid gap-8 md:grid-cols-2 max-w-5xl">
              {faq.map((item) => (
                <div key={item.q} className="border-t border-border pt-6">
                  <h3 className="text-base font-semibold leading-snug">{item.q}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <h2 className="max-w-2xl text-4xl font-bold leading-[1.05] tracking-[-0.02em] md:text-5xl">
            Ready to let your users{" "}
            <span className="font-display font-normal italic text-signal">
              bring their own keys?
            </span>
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-background/70">
            byok-relay is open-source and free to self-host. Point an AI coding assistant at the
            integration guide and you're live in under 5 minutes.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 gap-2 px-5 text-sm bg-signal text-signal-foreground hover:bg-signal/90"
            >
              <Link to="/">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 gap-2 border-background/20 px-5 text-sm text-background hover:bg-background/10"
            >
              <a href={GH_URL} target="_blank" rel="noreferrer">
                <Github className="h-4 w-4" /> View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <Logo />
            <nav className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs">
              <Link
                to="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home →
              </Link>
              <a
                href={GH_URL}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub →
              </a>
              <a
                href="https://byokrelay.com/benchmarks"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Benchmarks →
              </a>
              <a
                href="https://relay.byokrelay.com"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Hosted relay →
              </a>
            </nav>
          </div>
          <div className="mt-8 font-mono text-[11px] text-muted-foreground">
            // byok-relay vs {competitor.name} · Apache 2.0
          </div>
        </div>
      </footer>
    </div>
  );
}
