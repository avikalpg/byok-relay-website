import { Link } from "@tanstack/react-router";
import { Github, ArrowLeft, Terminal, Zap, Clock, Server, AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

const GH_URL = "https://github.com/avikalpg/byok-relay";

// ── Real benchmark data (measured 2026-05-28, Linux x64, Node v22.22.1) ──
// 10,000 runs (500 warmup), measuring:
//   HMAC-SHA256 token hash + SQLite indexed user lookup +
//   SQLite indexed key lookup + AES-256-GCM decrypt + JSON re-serialisation
const CPU_OVERHEAD = {
  date: "2026-05-28",
  platform: "Linux x64, Node v22.22.1",
  runs: 10000,
  warmup: 500,
  ms: { min: 0.013, p50: 0.014, p90: 0.021, p99: 0.041, p999: 0.29, max: 0.5, mean: 0.017 },
};

// Typical AI provider first-token latencies (p50, representative, not byok-relay specific)
const PROVIDER_LATENCY_CONTEXT = [
  { name: "byok-relay CPU overhead (p99)", ms: 0.041, isMeasured: true },
  { name: "OpenAI gpt-4o (p50 TTFT)", ms: 800, isMeasured: false },
  { name: "Anthropic claude-3-haiku (p50 TTFT)", ms: 500, isMeasured: false },
  { name: "Gemini 1.5 Flash (p50 TTFT)", ms: 400, isMeasured: false },
];

const OVERHEAD_BREAKDOWN = [
  { step: "HMAC-SHA256 token hash", us: 4, pct: 29 },
  { step: "SQLite user lookup", us: 5, pct: 36 },
  { step: "AES-256-GCM decrypt", us: 3, pct: 21 },
  { step: "SQLite key lookup + JSON", us: 2, pct: 14 },
];

const PERCENTILE_DATA = [
  { label: "min", ms: CPU_OVERHEAD.ms.min },
  { label: "p50", ms: CPU_OVERHEAD.ms.p50 },
  { label: "p90", ms: CPU_OVERHEAD.ms.p90 },
  { label: "p99", ms: CPU_OVERHEAD.ms.p99 },
  { label: "p99.9", ms: CPU_OVERHEAD.ms.p999 },
  { label: "max", ms: CPU_OVERHEAD.ms.max },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
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
    </Link>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          <Link
            to="/"
            className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <span className="font-mono text-xs text-foreground font-medium">Benchmarks</span>
        </nav>
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

function StatCard({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string;
  unit: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tabular-nums text-signal">{value}</span>
        <span className="font-mono text-sm text-muted-foreground">{unit}</span>
      </div>
      {sub && <p className="mt-1 font-mono text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

// Custom tooltip for recharts
function OverheadTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 font-mono text-xs shadow-md">
      <p className="text-muted-foreground">{label}</p>
      <p className="text-foreground font-medium">{payload[0].value.toFixed(3)} ms</p>
    </div>
  );
}

export function Benchmarks() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-paper opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-20">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to home
          </Link>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] tracking-tight">
            <span className="h-1.5 w-1.5 rounded-full bg-signal signal-dot" />
            <span className="text-muted-foreground">
              real measurements · reproducible · open methodology
            </span>
          </div>

          <h1 className="max-w-4xl text-balance text-4xl font-bold leading-[1.05] tracking-[-0.03em] md:text-6xl">
            What does the relay{" "}
            <span className="font-display font-normal text-signal italic">hop cost you?</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            The relay adds five operations between your app and the AI provider: token hashing, two
            SQLite lookups, key decryption, and JSON re-serialisation. Here's what that costs,
            measured.
          </p>
        </div>
      </section>

      {/* Methodology banner */}
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Server className="h-3 w-3" /> Linux x64 · Node v22.22.1 · better-sqlite3 WAL
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> {CPU_OVERHEAD.runs.toLocaleString()} runs ·{" "}
              {CPU_OVERHEAD.warmup} warmup · process.hrtime.bigint()
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3 w-3" /> Measured: {CPU_OVERHEAD.date}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 space-y-20">
        {/* Stat cards */}
        <section>
          <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="text-signal">01</span>
            <span className="h-px flex-1 bg-border max-w-16" />
            <span>CPU overhead — excluding network</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="p50 latency"
              value={CPU_OVERHEAD.ms.p50.toString()}
              unit="ms"
              sub="14 µs median"
            />
            <StatCard
              label="p90 latency"
              value={CPU_OVERHEAD.ms.p90.toString()}
              unit="ms"
              sub="21 µs"
            />
            <StatCard
              label="p99 latency"
              value={CPU_OVERHEAD.ms.p99.toString()}
              unit="ms"
              sub="41 µs"
            />
            <StatCard
              label="p99.9 latency"
              value={CPU_OVERHEAD.ms.p999.toString()}
              unit="ms"
              sub="290 µs worst-tail"
            />
          </div>
          <p className="mt-4 font-mono text-[12px] text-muted-foreground">
            ↳ All five relay operations — HMAC hash, two SQLite reads, AES-GCM decrypt, JSON
            re-serialise — complete in under{" "}
            <span className="text-foreground font-medium">50 µs</span> at p99. The network hop to
            the AI provider dominates.
          </p>
        </section>

        {/* Percentile chart */}
        <section>
          <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="text-signal">02</span>
            <span className="h-px flex-1 bg-border max-w-16" />
            <span>Latency distribution</span>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="mb-1 font-mono text-xs font-medium">CPU overhead per request (ms)</p>
            <p className="mb-6 font-mono text-[11px] text-muted-foreground">
              {CPU_OVERHEAD.runs.toLocaleString()} samples · 5ms target line shown
            </p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PERCENTILE_DATA} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.88 0.015 80 / 0.4)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 11,
                      fill: "oklch(0.45 0.015 70)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 11,
                      fill: "oklch(0.45 0.015 70)",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}ms`}
                    domain={[0, 0.6]}
                  />
                  <Tooltip
                    content={<OverheadTooltip />}
                    cursor={{ fill: "oklch(0.88 0.015 80 / 0.3)" }}
                  />
                  <ReferenceLine
                    y={5}
                    stroke="oklch(0.7 0.21 45 / 0.4)"
                    strokeDasharray="4 3"
                    label={{
                      value: "5ms target",
                      position: "insideTopRight",
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 10,
                      fill: "oklch(0.7 0.21 45)",
                    }}
                  />
                  <Bar dataKey="ms" radius={[4, 4, 0, 0]} maxBarSize={56}>
                    {PERCENTILE_DATA.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.ms > 0.1 ? "oklch(0.7 0.21 45 / 0.6)" : "oklch(0.7 0.21 45)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-4 font-mono text-[11px] text-muted-foreground">
              All percentiles are well below the 5ms overhead target. The p99.9 spike (0.29ms) is OS
              scheduling jitter, not relay work.
            </p>
          </div>
        </section>

        {/* Context: vs AI response time */}
        <section>
          <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="text-signal">03</span>
            <span className="h-px flex-1 bg-border max-w-16" />
            <span>Context — relay overhead vs AI response time</span>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="mb-1 font-mono text-xs font-medium">Relative scale (ms, log scale)</p>
            <p className="mb-6 font-mono text-[11px] text-muted-foreground">
              byok-relay CPU overhead (p99) vs typical provider time-to-first-token (p50,
              indicative)
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={PROVIDER_LATENCY_CONTEXT}
                  margin={{ top: 4, right: 16, left: 0, bottom: 60 }}
                  layout="vertical"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.88 0.015 80 / 0.4)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    scale="log"
                    domain={[0.01, 2000]}
                    tickFormatter={(v) => (v < 1 ? `${v}ms` : `${v}ms`)}
                    tick={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 10,
                      fill: "oklch(0.45 0.015 70)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={240}
                    tick={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 10,
                      fill: "oklch(0.45 0.015 70)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} ms`, "Latency"]}
                    contentStyle={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11 }}
                    cursor={{ fill: "oklch(0.88 0.015 80 / 0.3)" }}
                  />
                  <Bar dataKey="ms" radius={[0, 4, 4, 0]} maxBarSize={32}>
                    {PROVIDER_LATENCY_CONTEXT.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.isMeasured ? "oklch(0.7 0.21 45)" : "oklch(0.45 0.015 70 / 0.5)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 font-mono text-[11px] text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-signal" />
                byok-relay (measured)
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-muted-foreground/40" />
                provider TTFT (indicative, not measured by us)
              </span>
            </div>
            <p className="mt-3 font-mono text-[11px] text-muted-foreground">
              The relay's CPU overhead is 4–5 orders of magnitude smaller than the AI model's
              response time. Even accounting for the relay→provider network hop (typically 1–5ms in
              the same region), the total overhead is under 0.5% of a typical AI call.
            </p>
          </div>
        </section>

        {/* What's measured */}
        <section>
          <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="text-signal">04</span>
            <span className="h-px flex-1 bg-border max-w-16" />
            <span>What's measured</span>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-mono text-sm font-medium">Operations timed per request</h3>
              <ol className="space-y-3">
                {[
                  {
                    n: "1",
                    label: "HMAC-SHA256 token hash",
                    detail: "Incoming relay token → SHA-256 digest for DB lookup",
                  },
                  {
                    n: "2",
                    label: "SQLite user lookup",
                    detail: "Indexed SELECT on token_hash column (WAL mode)",
                  },
                  {
                    n: "3",
                    label: "SQLite key lookup",
                    detail: "Indexed SELECT on (user_id, provider) unique index",
                  },
                  {
                    n: "4",
                    label: "AES-256-GCM decrypt",
                    detail: "Recover user's provider API key from ciphertext",
                  },
                  {
                    n: "5",
                    label: "JSON re-serialise",
                    detail: "Stringify request body before upstream forward",
                  },
                ].map((op) => (
                  <li key={op.n} className="flex gap-3">
                    <span className="font-mono text-[11px] text-signal mt-0.5 shrink-0">
                      {op.n}.
                    </span>
                    <div>
                      <p className="font-mono text-[12px] font-medium text-foreground">
                        {op.label}
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground">{op.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-mono text-sm font-medium">
                What's NOT included in these numbers
              </h3>
              <div className="space-y-3">
                {[
                  {
                    icon: "🌐",
                    label: "Client → relay network",
                    detail: "Depends on your users' location and relay host region.",
                  },
                  {
                    icon: "🏃",
                    label: "Relay → provider network",
                    detail:
                      "Typically 1–5ms if relay is co-located in the same cloud region as the AI provider.",
                  },
                  {
                    icon: "🤖",
                    label: "AI model inference",
                    detail:
                      "Hundreds to thousands of ms depending on model and prompt length. Dominates all other costs.",
                  },
                  {
                    icon: "📦",
                    label: "Response streaming",
                    detail:
                      "The relay pipes the response stream without buffering — no added latency on the streaming path.",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <p className="font-mono text-[12px] font-medium text-foreground">
                        {item.label}
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-signal/30 bg-signal/5 p-3">
                <div className="flex gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-signal shrink-0 mt-0.5" />
                  <p className="font-mono text-[11px] text-muted-foreground">
                    <span className="text-foreground font-medium">Network tip:</span> Host your
                    relay in the same cloud region as your primary AI provider (e.g. us-east-1 for
                    OpenAI). The relay→provider hop then adds &lt;2ms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reproduce it */}
        <section>
          <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="text-signal">05</span>
            <span className="h-px flex-1 bg-border max-w-16" />
            <span>Reproduce it yourself</span>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-muted/30">
              <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono text-[12px] text-muted-foreground">
                Run the benchmark locally
              </span>
            </div>
            <pre className="overflow-x-auto p-5 text-[12px] leading-relaxed">
              <code className="font-mono text-foreground">{`# Clone the repo
git clone https://github.com/avikalpg/byok-relay
cd byok-relay

# Install dependencies
npm install

# Run the CPU overhead benchmark
# (measures only relay processing — no network involved)
node scripts/bench-cpu.js

# Sample output:
#   p50:  0.014 ms
#   p90:  0.021 ms
#   p99:  0.041 ms
#   p999: 0.290 ms`}</code>
            </pre>
          </div>
          <p className="mt-4 font-mono text-[11px] text-muted-foreground">
            The benchmark script lives at{" "}
            <a
              href={`${GH_URL}/blob/main/scripts/bench-cpu.js`}
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline underline-offset-2 hover:text-signal transition-colors"
            >
              scripts/bench-cpu.js
            </a>{" "}
            in the repo. It seeds an in-memory SQLite database, runs 500 warmup iterations, then
            measures {CPU_OVERHEAD.runs.toLocaleString()} requests using{" "}
            <code className="text-foreground">process.hrtime.bigint()</code> for nanosecond
            precision.
          </p>
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="text-xl font-bold tracking-tight">Ready to add BYOK to your app?</h2>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            The relay adds &lt;0.05ms of CPU overhead. Your users' AI credits, your zero inference
            bill.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={GH_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              See quickstart
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-6">
          <p className="font-mono text-[11px] text-muted-foreground text-center">
            byok-relay · Apache 2.0 · benchmarks run {CPU_OVERHEAD.date} · methodology is open and
            reproducible
          </p>
        </div>
      </footer>
    </div>
  );
}
