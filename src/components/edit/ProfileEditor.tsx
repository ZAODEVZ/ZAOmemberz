"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { shortAddress } from "@/lib/format";
import type { PublicProfile } from "@/lib/profiles";

interface Session {
  wallet: string;
  fid?: number;
  method: "siwe" | "siwf";
}

interface LinkRow {
  platform: string;
  urlOrHandle: string;
}

export function ProfileEditor({
  session,
  onLogout,
}: {
  session: Session;
  onLogout: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [discordId, setDiscordId] = useState("");
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [status, setStatus] = useState<
    { kind: "idle" | "saving" | "ok" | "err"; msg?: string }
  >({ kind: "idle" });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/profiles/${session.wallet}`);
        if (res.ok) {
          const { profile } = (await res.json()) as { profile: PublicProfile };
          setExists(true);
          setDisplayName(profile.displayName ?? "");
          setAvatarUrl(profile.avatarUrl ?? "");
          setBio(profile.bio ?? "");
          setDiscordId(profile.discordId ?? "");
          setLinks(profile.socialLinks);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [session.wallet]);

  function updateLink(i: number, patch: Partial<LinkRow>) {
    setLinks((rows) =>
      rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    );
  }

  async function save() {
    setStatus({ kind: "saving" });
    const payload = {
      displayName: displayName.trim() || null,
      avatarUrl: avatarUrl.trim() || null,
      bio: bio.trim() || null,
      discordId: discordId.trim() || null,
      farcasterFid: session.fid ?? null,
      socialLinks: links
        .filter((l) => l.platform.trim() && l.urlOrHandle.trim())
        .map((l) => ({
          platform: l.platform.trim(),
          urlOrHandle: l.urlOrHandle.trim(),
        })),
    };

    const res = exists
      ? await fetch(`/api/profiles/${session.wallet}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch(`/api/profiles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, walletAddress: session.wallet }),
        });

    if (res.ok) {
      setExists(true);
      setStatus({ kind: "ok", msg: "Saved." });
    } else {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setStatus({ kind: "err", msg: body.error ?? "Save failed." });
    }
  }

  if (loading) {
    return <p className="text-center text-mist-400">Loading your profile…</p>;
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            {exists ? "Edit your profile" : "Create your profile"}
          </h1>
          <p className="mt-1 font-mono text-xs text-mist-400">
            {shortAddress(session.wallet)}
            {session.fid != null && ` · FID ${session.fid}`} ·{" "}
            {session.method === "siwf" ? "Farcaster" : "Wallet"}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-mist-300 transition hover:bg-white/5"
        >
          Log out
        </button>
      </div>

      <div className="space-y-5 rounded-3xl border border-white/5 bg-ink-850/60 p-6">
        <Field label="Display name">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How you want to be shown"
            maxLength={80}
            className={inputCls}
          />
        </Field>

        <Field label="Avatar URL" hint="A direct https link to an image.">
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://…"
            className={inputCls}
          />
        </Field>

        <Field label="Bio">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A few sentences about you and your work."
            rows={4}
            maxLength={1000}
            className={inputCls}
          />
        </Field>

        <Field
          label="Discord ID"
          hint="Numeric Discord user ID — lets ZAO Discord tools find you."
        >
          <input
            value={discordId}
            onChange={(e) => setDiscordId(e.target.value)}
            placeholder="e.g. 123456789012345678"
            className={inputCls}
          />
        </Field>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-mist-200">Links</span>
            <button
              onClick={() =>
                setLinks((r) => [...r, { platform: "", urlOrHandle: "" }])
              }
              className="text-xs font-medium text-accent-400 hover:text-accent-500"
            >
              + Add link
            </button>
          </div>
          <div className="space-y-2">
            {links.map((l, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={l.platform}
                  onChange={(e) => updateLink(i, { platform: e.target.value })}
                  placeholder="platform"
                  className={`${inputCls} w-32 shrink-0`}
                />
                <input
                  value={l.urlOrHandle}
                  onChange={(e) =>
                    updateLink(i, { urlOrHandle: e.target.value })
                  }
                  placeholder="url or @handle"
                  className={inputCls}
                />
                <button
                  onClick={() =>
                    setLinks((r) => r.filter((_, idx) => idx !== i))
                  }
                  className="shrink-0 rounded-lg border border-white/10 px-3 text-mist-400 transition hover:bg-white/5 hover:text-red-300"
                  aria-label="Remove link"
                >
                  ×
                </button>
              </div>
            ))}
            {links.length === 0 && (
              <p className="text-xs text-mist-400">
                No links yet. Add X, GitHub, your site, Warpcast…
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={save}
            disabled={status.kind === "saving"}
            className="rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {status.kind === "saving" ? "Saving…" : "Save profile"}
          </button>
          {exists && (
            <Link
              href={`/profile/${session.wallet}`}
              className="text-sm text-mist-300 hover:text-mist-100"
            >
              View public profile →
            </Link>
          )}
          {status.kind === "ok" && (
            <span className="text-sm text-signal-400">{status.msg}</span>
          )}
          {status.kind === "err" && (
            <span className="text-sm text-red-300">{status.msg}</span>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-ink-900/70 px-3.5 py-2.5 text-sm text-mist-100 outline-none transition placeholder:text-mist-400/60 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-mist-200">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-mist-400">{hint}</span>}
    </label>
  );
}
