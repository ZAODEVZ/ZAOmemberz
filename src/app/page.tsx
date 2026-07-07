import { SiteHeader } from "@/components/SiteHeader";
import { MemberCard } from "@/components/MemberCard";
import { safeDirectory } from "@/lib/safe-data";
import {
  RESPECT_HOLDERS,
  CHAIN,
  weeksRunning,
  runStartLabel,
} from "@/lib/ecosystem-facts";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { profiles } = await safeDirectory();
  const weeks = weeksRunning();

  return (
    <main className="min-h-dvh">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-6 pt-16 sm:pt-24">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-mist-300">
          <span className="h-1.5 w-1.5 rounded-full bg-signal-400" />
          The ZAO ecosystem identity layer
        </p>
        <h1 className="max-w-3xl text-balance text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
          The people building{" "}
          <span className="bg-gradient-to-r from-accent-400 via-accent-500 to-signal-400 bg-clip-text text-transparent">
            The ZAO
          </span>
          .
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-mist-300">
          One shared profile, anchored to your wallet, that every ZAO app can
          read. Own your identity once — show up everywhere.
        </p>
      </section>

      {/* ── Verified stat strip (REAL numbers only) ──────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-6">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            value={RESPECT_HOLDERS.unique.toString()}
            label="Unique Respect holders"
            sub={`${RESPECT_HOLDERS.og} OG · ${RESPECT_HOLDERS.zor} ZOR · ${RESPECT_HOLDERS.both} both`}
          />
          <Stat
            value={`~${weeks}`}
            label="Weeks running, unbroken"
            sub={runStartLabel()}
          />
          <Stat value={CHAIN} label="Settled on-chain" sub="Respect on L2" />
          <Stat
            value={profiles.length.toString()}
            label="Profiles on ZAOmemberz"
            sub={profiles.length === 1 ? "member" : "members"}
          />
        </dl>
        <p className="mt-3 text-xs text-mist-400/70">
          Every figure above is independently verifiable. Respect-holder counts
          are on-chain on {CHAIN}; the run count is computed live from{" "}
          {runStartLabel()}.
        </p>
      </section>

      {/* ── Directory ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-24 pt-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-xl font-bold tracking-tight">Members</h2>
          <span className="text-sm text-mist-400">
            {profiles.length} listed
          </span>
        </div>

        {profiles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-ink-850/40 px-6 py-16 text-center">
            <p className="text-mist-200">No profiles yet.</p>
            <p className="mt-1 text-sm text-mist-400">
              Members will appear here as they join. Nothing is fabricated —
              this list reflects real, seeded profiles only.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((p) => (
              <MemberCard key={p.walletAddress} p={p} />
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}

function Stat({
  value,
  label,
  sub,
}: {
  value: string;
  label: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-ink-850/60 p-5">
      <dd className="text-3xl font-black tracking-tight text-mist-100">
        {value}
      </dd>
      <dt className="mt-1 text-sm font-medium text-mist-300">{label}</dt>
      {sub && <p className="mt-0.5 text-xs text-mist-400">{sub}</p>}
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto max-w-6xl px-5 py-8 text-sm text-mist-400">
        <p>
          ZAOmemberz — the shared identity layer for the ZAO ecosystem. Public
          read API: <code className="text-mist-300">/api/directory</code>.
        </p>
      </div>
    </footer>
  );
}
