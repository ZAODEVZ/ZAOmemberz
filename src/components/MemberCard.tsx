import Link from "next/link";
import { Avatar } from "./Avatar";
import { shortAddress } from "@/lib/format";
import type { PublicProfile } from "@/lib/profiles";

export function MemberCard({ p }: { p: PublicProfile }) {
  // Prefer FID route when present (nicer, stable), else wallet.
  const href = `/profile/${p.walletAddress}`;
  const name = p.displayName || p.ens.name || shortAddress(p.walletAddress);

  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-white/5 bg-ink-850/60 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-white/10 hover:bg-ink-800/70"
    >
      <div
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent-500/40 to-transparent opacity-0 transition group-hover:opacity-100"
        aria-hidden
      />
      <div className="flex items-center gap-3.5">
        <Avatar
          src={p.avatarUrl}
          name={p.displayName}
          wallet={p.walletAddress}
          size={52}
        />
        <div className="min-w-0">
          <div className="truncate font-semibold text-mist-100">{name}</div>
          <div className="truncate font-mono text-xs text-mist-400">
            {p.ens.name ? p.ens.name : shortAddress(p.walletAddress)}
          </div>
        </div>
      </div>
      {p.bio ? (
        <p className="line-clamp-2 text-sm leading-relaxed text-mist-300">
          {p.bio}
        </p>
      ) : (
        <p className="text-sm italic text-mist-400/70">No bio yet.</p>
      )}
      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
        {p.farcasterFid != null && <Tag>FID {p.farcasterFid}</Tag>}
        {p.socialLinks.slice(0, 3).map((l) => (
          <Tag key={l.platform + l.urlOrHandle}>{l.platform}</Tag>
        ))}
      </div>
    </Link>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-mist-300 ring-1 ring-white/5">
      {children}
    </span>
  );
}
