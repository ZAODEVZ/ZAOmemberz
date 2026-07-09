import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isAddress } from "viem";
import { SiteHeader } from "@/components/SiteHeader";
import { Avatar } from "@/components/Avatar";
import { shortAddress } from "@/lib/format";
import {
  getProfileByWallet,
  getProfileByFid,
  cacheEns,
  type ProfileWithLinks,
} from "@/lib/profiles";
import { resolveEns } from "@/lib/ens";
import { CHAIN } from "@/lib/ecosystem-facts";

export const dynamic = "force-dynamic";

async function load(handle: string): Promise<ProfileWithLinks | null> {
  try {
    if (isAddress(handle)) return await getProfileByWallet(handle);
    const n = Number(handle);
    if (Number.isInteger(n) && n > 0) return await getProfileByFid(n);
    return null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const p = await load(handle);
  if (!p) return { title: "Profile not found" };
  const name = p.displayName || p.ensName || shortAddress(p.walletAddress);
  return { title: name, description: p.bio ?? `${name} on the ZAO ecosystem.` };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = await load(handle);
  if (!profile) notFound();

  // Live, never-stale ENS resolution. We show the freshly-resolved value with
  // the exact time it was checked, and opportunistically refresh the cache.
  const ens = await resolveEns(profile.walletAddress);
  cacheEns(profile.id, ens.name, new Date(ens.checkedAt)).catch(() => {});

  const displayName =
    profile.displayName || ens.name || shortAddress(profile.walletAddress);
  const avatar = profile.avatarUrl || ens.avatar;

  return (
    <main className="min-h-dvh">
      <SiteHeader />

      <div className="mx-auto max-w-3xl px-5 py-10 sm:py-16">
        {/* ── Header card ─────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-ink-850/60 p-6 sm:p-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(600px 200px at 20% -20%, rgba(91,109,255,0.18), transparent 60%)",
            }}
            aria-hidden
          />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar
              src={avatar}
              name={profile.displayName}
              wallet={profile.walletAddress}
              size={96}
              className="shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                {displayName}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {ens.name && (
                  <span className="rounded-full bg-accent-500/15 px-2.5 py-0.5 text-xs font-medium text-accent-400 ring-1 ring-accent-500/20">
                    {ens.name}
                  </span>
                )}
                {profile.farcasterFid != null && (
                  <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-mist-300 ring-1 ring-white/10">
                    Farcaster · FID {profile.farcasterFid}
                  </span>
                )}
              </div>
              <p className="mt-2 font-mono text-xs text-mist-400">
                {profile.walletAddress}
              </p>
            </div>
          </div>

          {profile.bio && (
            <p className="relative mt-6 whitespace-pre-line leading-relaxed text-mist-200">
              {profile.bio}
            </p>
          )}
        </div>

        {/* ── Links ───────────────────────────────────────────────── */}
        {profile.socialLinks.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-mist-400">
              Links
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {profile.socialLinks.map((l) => {
                const isUrl = /^https?:\/\//i.test(l.urlOrHandle);
                const inner = (
                  <>
                    <span className="text-xs font-medium uppercase tracking-wide text-mist-400">
                      {l.platform}
                    </span>
                    <span className="truncate text-mist-200">
                      {l.urlOrHandle}
                    </span>
                  </>
                );
                return isUrl ? (
                  <a
                    key={l.id}
                    href={l.urlOrHandle}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="flex flex-col gap-0.5 rounded-xl border border-white/5 bg-ink-850/60 px-4 py-3 transition hover:border-white/10 hover:bg-ink-800/70"
                  >
                    {inner}
                  </a>
                ) : (
                  <div
                    key={l.id}
                    className="flex flex-col gap-0.5 rounded-xl border border-white/5 bg-ink-850/60 px-4 py-3"
                  >
                    {inner}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Verifiable on-chain facts ───────────────────────────── */}
        <section className="mt-6 rounded-2xl border border-white/5 bg-ink-900/50 p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-mist-400">
            Verifiable facts
          </h2>
          <dl className="space-y-2 text-sm">
            <Fact
              term="Primary ENS"
              value={ens.name ?? "None set"}
              note={`resolved live · ${new Date(
                ens.checkedAt,
              ).toUTCString()}`}
            />
            <Fact term="Anchor wallet" value={profile.walletAddress} />
            <Fact term="Ecosystem chain" value={CHAIN} />
          </dl>
        </section>

        <p className="mt-4 text-xs text-mist-400/70">
          ENS is resolved fresh from Ethereum mainnet on each view — never a
          cached copy. Other fields are self-reported by the member.
        </p>
      </div>
    </main>
  );
}

function Fact({
  term,
  value,
  note,
}: {
  term: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-white/5 pb-2 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between">
      <dt className="text-mist-400">{term}</dt>
      <dd className="text-right">
        <span className="break-all font-mono text-mist-100">{value}</span>
        {note && <div className="text-[11px] text-mist-400/70">{note}</div>}
      </dd>
    </div>
  );
}
