"use client";

import { useEffect, useState, useCallback } from "react";
import { SignInButton, type StatusAPIResponse } from "@farcaster/auth-kit";
import { signInWithEthereum } from "@/lib/client/siwe-client";

/**
 * The login gate for the self-service editor.
 *
 * Primary: Sign-In-With-Farcaster (AuthKit) — the recommended path.
 * Fallback: "Don't have Farcaster? Use your wallet" → Sign-In-With-Ethereum.
 */
export function LoginPanel({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [nonce, setNonce] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [walletBusy, setWalletBusy] = useState(false);

  // Fetch a server-issued nonce up front so the Farcaster button can bind to
  // it (this also sets the nonce cookie the server verifies against).
  const refreshNonce = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/nonce");
      const { nonce } = (await res.json()) as { nonce: string };
      setNonce(nonce);
    } catch {
      setError("Couldn't reach the server. Try again.");
    }
  }, []);

  useEffect(() => {
    refreshNonce();
  }, [refreshNonce]);

  const handleFarcasterSuccess = useCallback(
    async (res: StatusAPIResponse) => {
      setError(null);
      if (!res.message || !res.signature) {
        setError("Farcaster returned an incomplete signature.");
        return;
      }
      const verify = await fetch("/api/auth/farcaster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: res.message,
          signature: res.signature,
        }),
      });
      if (verify.ok) {
        onLoggedIn();
      } else {
        const body = (await verify.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(body.error ?? "Farcaster verification failed.");
        refreshNonce();
      }
    },
    [onLoggedIn, refreshNonce],
  );

  const handleWallet = useCallback(async () => {
    setError(null);
    setWalletBusy(true);
    const res = await signInWithEthereum();
    setWalletBusy(false);
    if (res.ok) onLoggedIn();
    else setError(res.error ?? "Wallet sign-in failed.");
  }, [onLoggedIn]);

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-white/5 bg-ink-850/60 p-8 text-center">
      <h1 className="text-2xl font-black tracking-tight">Edit your profile</h1>
      <p className="mt-2 text-sm text-mist-300">
        Prove you own your identity to edit your ZAO profile.
      </p>

      <div className="mt-7 flex flex-col items-center gap-4">
        <div className="[&_button]:!rounded-xl">
          <SignInButton
            nonce={nonce ?? undefined}
            onSuccess={handleFarcasterSuccess}
            onError={() => setError("Farcaster sign-in was cancelled or failed.")}
          />
        </div>

        <div className="flex w-full items-center gap-3 text-xs text-mist-400">
          <span className="h-px flex-1 bg-white/10" />
          or
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <button
          onClick={handleWallet}
          disabled={walletBusy}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-mist-100 transition hover:bg-white/10 disabled:opacity-50"
        >
          {walletBusy
            ? "Waiting for signature…"
            : "Don't have Farcaster? Use your wallet"}
        </button>
      </div>

      {error && (
        <p className="mt-5 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300 ring-1 ring-red-500/20">
          {error}
        </p>
      )}
    </div>
  );
}
