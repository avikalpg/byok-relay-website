import { Github, ArrowRight, Check, X, AlertTriangle, Terminal, KeyRound, Shield, Zap, Lock, Server, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "#problem", label: "Problem" },
  { href: "#solution", label: "Solution" },
  { href: "#quickstart", label: "Quickstart" },
  { href: "#compare", label: "Compare" },
];

const GH_URL = "https://github.com/avikalpg/byok-relay";

function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative grid h-7 w-7 place-items-center rounded-md border border-foreground/15 bg-foreground text-background">
        <span className="absolute -left-px top-1/2 h-px w-2 -translate-y-1/2 bg-signal" />
        <span className="absolute -right-px top-1/2 h-px w-2 -translate-y-1/2 bg-signal" />
        <span className="h-2 w-2 rounded-full bg-signal signal-dot" />
      </div>
      <span className="font-mono text-[15px] font-medium tracking-tight">
        byok<span className="text-muted-foreground">-</span>relay
      </span>
    </div>
  );
}

function SectionLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
      <span className="text-signal">{n}</span>
      <span className="h-px flex-1 bg-border max-w-16" />
      <span>{children}</span>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
        <a href={GH_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 font-mono text-xs hover:border-foreground/40 transition-colors">
          <Github className="h-3.5 w-3.5" />
          <span>avikalpg/byok-relay</span>
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 grid-paper opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-32 md:pb-32">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] tracking-tight">
          <span className="h-1.5 w-1.5 rounded-full bg-signal signal-dot" />
          <span className="text-muted-foreground">v1 — open source · Apache 2.0</span>
        </div>

        <h1 className="max-w-5xl text-balance text-5xl font-bold leading-[1.02] tracking-[-0.03em] md:text-7xl lg:text-[88px]">
          Your users already have{" "}
          <span className="font-display font-normal text-signal">AI keys.</span>
          <br />
          Let them use them.
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          Millions of developers have OpenAI, Anthropic, or Gemini keys — from their employer, startup credits, or their own accounts. If your product doesn't accept them, you're losing those users to tools that do.{" "}
          <span className="text-foreground">byok-relay is the open-source relay that changes that.</span>
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="h-12 gap-2 px-5 text-sm">
            <a href="#quickstart">
              Get started in 5 minutes <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 gap-2 border-foreground/20 px-5 text-sm">
            <a href={GH_URL} target="_blank" rel="noreferrer">
              <Github className="h-4 w-4" /> View on GitHub
            </a>
          </Button>
        </div>

        {/* relay diagram */}
        <div className="mt-20 grid grid-cols-3 items-center gap-3 rounded-xl border border-border bg-card p-6 font-mono text-xs md:gap-6 md:p-8 md:text-sm">
          <div className="flex flex-col items-start gap-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">browser</span>
            <span className="text-foreground">your app</span>
          </div>
          <div className="relative flex items-center">
            <div className="h-px flex-1 bg-border" />
            <div className="absolute inset-0 relay-flow opacity-70" style={{ height: 1, top: "50%" }} />
            <div className="mx-2 rounded-md border border-signal/40 bg-signal/10 px-2 py-1 text-[10px] uppercase tracking-widest text-signal">
              relay
            </div>
            <div className="h-px flex-1 bg-border" />
            <div className="absolute inset-0 relay-flow opacity-70" style={{ height: 1, top: "50%" }} />
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">provider</span>
            <span className="text-foreground">openai · anthropic · gemini</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const cards = [
    {
      icon: KeyRound,
      tag: "the lost users",
      title: "Won't pay twice",
      body: "Developers with employer-funded keys, startup program credits (YC, Antler, AWS Activate, Azure for Startups), or personal accounts bounce from products that don't support BYOK.",
    },
    {
      icon: AlertTriangle,
      tag: "the cors wall",
      title: "Can't call from the browser",
      body: "Browser apps can't call AI APIs directly. api.openai.com blocks browser requests. Putting keys in frontend code exposes them to anyone who opens DevTools.",
    },
    {
      icon: Server,
      tag: "the backend trap",
      title: "Don't want to ship infra",
      body: "You could build a backend just to proxy API keys. But you're here to validate an idea, not maintain infrastructure.",
    },
  ];
  return (
    <section id="problem" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <SectionLabel n="01">the problem</SectionLabel>
        <h2 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-[-0.02em] md:text-5xl">
          You're losing users who already have what they need.
        </h2>
        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
          {cards.map((c) => (
            <div key={c.title} className="flex flex-col gap-5 bg-card p-7">
              <div className="flex items-center justify-between">
                <c.icon className="h-5 w-5 text-signal" strokeWidth={1.5} />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{c.tag}</span>
              </div>
              <h3 className="text-2xl font-semibold leading-tight tracking-tight">{c.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Solution() {
  return (
    <section id="solution" className="relative border-b border-border bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-background/50">
          <span className="text-signal">02</span>
          <span className="h-px w-16 bg-background/20" />
          <span>the solution</span>
        </div>
        <h2 className="max-w-4xl text-4xl font-bold leading-[1.05] tracking-[-0.02em] md:text-5xl">
          A relay your users connect{" "}
          <span className="font-display font-normal italic text-signal">their own keys</span> to.
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-background/70">
          byok-relay sits between your frontend and any AI provider. Users enter their key once — encrypted and stored server-side, never returned. Your app gets a relay token. No CORS. No exposed keys. No backend to build.
        </p>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            { n: "01", t: "User registers a key", b: "Relay encrypts it (AES-256-GCM) and returns a relay token. The key is never returned again." },
            { n: "02", t: "App sends requests with the token", b: "Relay injects the real key and proxies the request to the provider. No CORS, no exposure." },
            { n: "03", t: "Provider bills the user directly", b: "Their credits, their account. You spent $0 on inference." },
          ].map((s) => (
            <div key={s.n} className="relative rounded-xl border border-background/10 bg-background/[0.03] p-6">
              <div className="mb-6 flex items-baseline gap-2 font-mono text-signal">
                <span className="text-3xl font-bold">{s.n}</span>
                <span className="h-px flex-1 bg-background/10" />
              </div>
              <h3 className="text-xl font-semibold leading-tight">{s.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-background/60">{s.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Unlocks() {
  const items = [
    { t: "Reach users who won't pay twice", b: "People with employer keys or startup credits are a large, ignored segment. They're not price-sensitive — they just need a key slot." },
    { t: "\"Free forever\" that actually means free", b: "No billing page, no credit card, no trial limits. Users connect their key and start. The lowest possible signup friction." },
    { t: "Remove the #1 early-stage objection", b: "\"I'd try this but I don't want to pay for the AI on top of your tool.\" That objection disappears entirely." },
    { t: "Your AI costs stay flat as you scale", b: "Each user's requests use their own credits. Your infra bill doesn't grow with your user count." },
  ];
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <SectionLabel n="03">what this unlocks</SectionLabel>
        <h2 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-[-0.02em] md:text-5xl">
          What BYOK support does for{" "}
          <span className="font-display font-normal italic">your product.</span>
        </h2>
        <div className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {items.map((it) => (
            <div key={it.t} className="group border-t border-border pt-6">
              <div className="mb-3 flex items-start gap-3">
                <ArrowRight className="mt-1 h-5 w-5 text-signal transition-transform group-hover:translate-x-1" />
                <h3 className="text-2xl font-semibold leading-tight tracking-tight">{it.t}</h3>
              </div>
              <p className="ml-8 max-w-md text-base leading-relaxed text-muted-foreground">{it.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CodeBlock({ children, language = "bash" }: { children: string; language?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <div className="flex items-center gap-2">
          <Terminal className="h-3 w-3" />
          <span>{language}</span>
        </div>
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-border" />
          <span className="h-2 w-2 rounded-full bg-border" />
          <span className="h-2 w-2 rounded-full bg-signal/60" />
        </div>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-foreground">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function Quickstart() {
  return (
    <section id="quickstart" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <SectionLabel n="04">quickstart</SectionLabel>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-4xl font-bold leading-[1.05] tracking-[-0.02em] md:text-5xl">
              Up and running in{" "}
              <span className="font-display font-normal italic text-signal">60 seconds.</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Single Node.js process. SQLite. No Docker compose, no Kubernetes, no managed services.
            </p>
            <div className="mt-8 rounded-lg border border-signal/30 bg-signal/[0.06] p-5">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-signal">
                <Zap className="h-3 w-3" /> hosted option
              </div>
              <p className="mt-2 text-sm leading-relaxed">
                Or use the hosted relay →{" "}
                <a href="https://relay.byokrelay.com" className="font-mono text-foreground underline decoration-signal decoration-2 underline-offset-4">
                  relay.byokrelay.com
                </a>{" "}
                — no setup required.
              </p>
            </div>
          </div>
          <CodeBlock>{`git clone https://github.com/avikalpg/byok-relay.git
cd byok-relay && npm install
echo "ENCRYPTION_SECRET=$(openssl rand -hex 32)" > .env
echo "ALLOWED_ORIGINS=https://your-app.com" >> .env
npm start`}</CodeBlock>
        </div>
      </div>
    </section>
  );
}

function AgentSection() {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-28">
        <SectionLabel n="05">for ai-assisted integration</SectionLabel>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <h2 className="text-4xl font-bold leading-[1.05] tracking-[-0.02em] md:text-5xl">
              Using a coding agent?{" "}
              <span className="font-display font-normal italic">Point it here.</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Cursor, Claude, Copilot, or any MCP-powered agent — point it at the byok-relay skill and let it handle the integration end-to-end.
            </p>
          </div>
          <CodeBlock language="prompt">{`Read the byok-relay integration guide at:
https://byokrelay.com/skill

Then integrate byok-relay into this project
using the hosted relay at https://relay.byokrelay.com`}</CodeBlock>
        </div>
      </div>
    </section>
  );
}

function Providers() {
  const providers = [
    { name: "OpenAI", note: "GPT-4o, o3" },
    { name: "Anthropic", note: "Claude 3.5, 4" },
    { name: "Google Gemini", note: "1.5, 2.0" },
    { name: "Groq", note: "Llama, Mixtral" },
    { name: "Mistral", note: "Large, Codestral" },
    { name: "OpenRouter", note: "200+ models" },
    { name: "Any OpenAI-compatible endpoint", note: "self-hosted, vLLM, etc." },
  ];
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <SectionLabel n="06">supported providers</SectionLabel>
        <h2 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-[-0.02em] md:text-5xl">
          Works with the providers your users{" "}
          <span className="font-display font-normal italic">already have.</span>
        </h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => (
            <div key={p.name} className="flex items-center justify-between bg-card px-5 py-5">
              <div>
                <div className="text-base font-semibold tracking-tight">{p.name}</div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">{p.note}</div>
              </div>
              <Check className="h-4 w-4 text-signal" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Security() {
  const items = [
    { i: Lock, t: "AES-256-GCM encryption for all stored keys" },
    { i: KeyRound, t: "Keys never returned after registration — only usable via relay token" },
    { i: Activity, t: "Rate limiting: 100 req/min global, 20 AI req/min per relay token" },
    { i: Shield, t: "CORS locked to your declared allowed origins" },
    { i: Lock, t: "HTTPS required in production" },
    { i: Server, t: "Zero request logging — traffic is proxied, not stored" },
  ];
  return (
    <section className="border-b border-border bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-background/50">
          <span className="text-signal">07</span>
          <span className="h-px w-16 bg-background/20" />
          <span>security</span>
        </div>
        <h2 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-[-0.02em] md:text-5xl">
          Your users' keys are{" "}
          <span className="font-display font-normal italic text-signal">safe.</span>
        </h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-background/10 bg-background/10 md:grid-cols-2">
          {items.map((it, i) => (
            <div key={i} className="flex items-start gap-4 bg-foreground p-6">
              <it.i className="mt-0.5 h-5 w-5 shrink-0 text-signal" strokeWidth={1.5} />
              <p className="text-base leading-relaxed text-background/90">{it.t}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Compare() {
  const rows: { label: string; values: (boolean | "warn" | string)[] }[] = [
    { label: "Who holds the API keys", values: ["Your users", "OpenRouter", "Your org"] },
    { label: "Who pays for AI usage", values: ["Your users", "You (the dev)", "You (the org)"] },
    { label: "BYOK for end-users", values: [true, false, false] },
    { label: "Browser-safe (CORS handled)", values: [true, true, "warn"] },
    { label: "Self-hosted", values: [true, false, true] },
    { label: "Open source", values: ["Apache 2.0", false, true] },
    { label: "Model routing / fallbacks", values: [false, true, true] },
    { label: "Spend tracking / budgets", values: [false, true, true] },
  ];

  function Cell({ v, highlight }: { v: boolean | "warn" | string; highlight?: boolean }) {
    const base = "px-5 py-4 text-sm";
    const bg = highlight ? "bg-signal/[0.05]" : "";
    if (v === true)
      return (
        <td className={`${base} ${bg}`}>
          <div className="flex items-center gap-2 font-medium"><Check className="h-4 w-4 text-signal" /> Yes</div>
        </td>
      );
    if (v === false)
      return (
        <td className={`${base} ${bg} text-muted-foreground`}>
          <div className="flex items-center gap-2"><X className="h-4 w-4" /> No</div>
        </td>
      );
    if (v === "warn")
      return (
        <td className={`${base} ${bg}`}>
          <div className="flex items-center gap-2 text-muted-foreground"><AlertTriangle className="h-4 w-4" /> Requires backend</div>
        </td>
      );
    return <td className={`${base} ${bg} ${highlight ? "font-medium" : "text-muted-foreground"}`}>{v}</td>;
  }

  return (
    <section id="compare" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <SectionLabel n="08">comparison</SectionLabel>
        <h2 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-[-0.02em] md:text-5xl">
          Evaluating your <span className="font-display font-normal italic">options?</span>
        </h2>
        <div className="mt-12 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-4 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Capability</th>
                <th className="bg-signal/[0.05] px-5 py-4 text-left">
                  <div className="font-mono text-sm font-medium">byok-relay</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-signal">this project</div>
                </th>
                <th className="px-5 py-4 text-left">
                  <div className="font-mono text-sm font-medium text-muted-foreground">OpenRouter</div>
                </th>
                <th className="px-5 py-4 text-left">
                  <div className="font-mono text-sm font-medium text-muted-foreground">LiteLLM</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.label} className={i !== rows.length - 1 ? "border-b border-border" : ""}>
                  <td className="px-5 py-4 text-sm font-medium">{r.label}</td>
                  <Cell v={r.values[0]} highlight />
                  <Cell v={r.values[1]} />
                  <Cell v={r.values[2]} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          OpenRouter and LiteLLM are excellent tools — use them when you're paying for your users' AI and want routing + analytics. Use byok-relay when you want users to bring their own keys.
        </p>
      </div>
    </section>
  );
}

function Deploy() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <SectionLabel n="09">self-hosted or managed</SectionLabel>
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
          <div className="flex flex-col gap-6 bg-card p-8 md:p-10">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">option a</span>
              <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest">free · apache 2.0</span>
            </div>
            <h3 className="text-3xl font-bold tracking-tight">Self-hosted</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Single Node.js process + SQLite. Deploy on any VPS, Railway, Fly.io, or your own server. Zero vendor lock-in.
            </p>
            <div className="mt-auto pt-2">
              <Button asChild variant="outline" className="h-11 gap-2 border-foreground/20">
                <a href="https://vercel.com/new/clone?repository-url=https://github.com/avikalpg/byok-relay" target="_blank" rel="noreferrer">
                  Deploy on Vercel <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
          <div className="relative flex flex-col gap-6 bg-foreground p-8 text-background md:p-10">
            <div className="absolute right-6 top-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-signal">
              <span className="h-1.5 w-1.5 rounded-full bg-signal signal-dot" /> live now
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-background/50">option b</span>
            </div>
            <h3 className="text-3xl font-bold tracking-tight">Managed relay</h3>
            <p className="text-sm leading-relaxed text-background/70">
              We host it, you just integrate. Usage-based pricing at cost — the relay itself is cheap, because we're not paying for your inference.
            </p>
            <div className="mt-auto pt-2">
              <Button asChild className="h-11 gap-2 bg-signal text-signal-foreground hover:bg-signal/90">
                <a href="https://relay.byokrelay.com" target="_blank" rel="noreferrer">
                  Use relay.byokrelay.com <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="flex flex-col gap-3">
            <Logo />
            <p className="font-mono text-xs text-muted-foreground">Apache 2.0 — free to self-host.</p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs">
            <a href={GH_URL} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">GitHub →</a>
            <a href={`${GH_URL}#readme`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">Docs →</a>
            <a href="https://byokrelay.com/skill" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">Integration guide (SKILL.md) →</a>
            <a href="https://relay.byokrelay.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">Hosted relay →</a>
          </nav>
        </div>
        <div className="mt-12 border-t border-border pt-6 font-mono text-[11px] text-muted-foreground">
          // browser → relay → provider · keys stay with the user
        </div>
      </div>
    </footer>
  );
}

export function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Unlocks />
        <Quickstart />
        <AgentSection />
        <Providers />
        <Security />
        <Compare />
        <Deploy />
      </main>
      <Footer />
    </div>
  );
}
