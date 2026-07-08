"use client";

import { useMemo, useState } from "react";
import { MemberCard } from "./MemberCard";
import type { PublicProfile } from "@/lib/profiles";

/**
 * Client-side searchable member grid. Filtering happens in the browser over the
 * already-fetched directory (the full list is public anyway), so typing is
 * instant with no extra round-trips.
 */
export function DirectoryGrid({ profiles }: { profiles: PublicProfile[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return profiles;
    return profiles.filter((p) => {
      const haystack = [
        p.displayName,
        p.ens.name,
        p.walletAddress,
        p.bio,
        ...p.socialLinks.map((l) => `${l.platform} ${l.urlOrHandle}`),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [q, profiles]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold tracking-tight">Members</h2>
        <div className="flex items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, ENS, wallet…"
            aria-label="Search members"
            className="w-full rounded-xl border border-white/10 bg-ink-900/70 px-3.5 py-2 text-sm text-mist-100 outline-none transition placeholder:text-mist-400/60 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 sm:w-72"
          />
          <span className="whitespace-nowrap text-sm text-mist-400">
            {filtered.length}
            {filtered.length !== profiles.length && ` / ${profiles.length}`}
          </span>
        </div>
      </div>

      {profiles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-ink-850/40 px-6 py-16 text-center">
          <p className="text-mist-200">No profiles yet.</p>
          <p className="mt-1 text-sm text-mist-400">
            Members will appear here as they join. Nothing is fabricated — this
            list reflects real, seeded profiles only.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-ink-850/40 px-6 py-16 text-center">
          <p className="text-mist-300">
            No members match “<span className="text-mist-100">{q}</span>”.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <MemberCard key={p.walletAddress} p={p} />
          ))}
        </div>
      )}
    </>
  );
}
