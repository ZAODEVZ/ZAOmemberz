"use client";

import { SiweMessage } from "siwe";
import { AUTH_DOMAIN, AUTH_URL } from "@/lib/env";

/**
 * Browser-side Sign-In-With-Ethereum ("don't have Farcaster? use your wallet")
 * flow. Uses the injected EIP-1193 provider (window.ethereum) + viem-free
 * message construction via the `siwe` package, then hands the signature to our
 * server for verification.
 */

interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

function getProvider(): Eip1193Provider {
  const eth = (globalThis as { ethereum?: Eip1193Provider }).ethereum;
  if (!eth) {
    throw new Error(
      "No Ethereum wallet found. Install a browser wallet (e.g. MetaMask, Rabbit) or use Farcaster sign-in.",
    );
  }
  return eth;
}

export async function signInWithEthereum(): Promise<{
  ok: boolean;
  wallet?: string;
  error?: string;
}> {
  try {
    const provider = getProvider();

    const accounts = (await provider.request({
      method: "eth_requestAccounts",
    })) as string[];
    const address = accounts?.[0];
    if (!address) return { ok: false, error: "No account authorized" };

    const chainIdHex = (await provider.request({
      method: "eth_chainId",
    })) as string;
    const chainId = parseInt(chainIdHex, 16) || 1;

    // Fetch a server-issued nonce so the signature is bound to our session.
    const nonceRes = await fetch("/api/auth/nonce");
    const { nonce } = (await nonceRes.json()) as { nonce: string };

    const message = new SiweMessage({
      domain: AUTH_DOMAIN,
      address,
      statement: "Sign in to ZAOmemberz to edit your ZAO profile.",
      uri: AUTH_URL,
      version: "1",
      chainId,
      nonce,
    }).prepareMessage();

    const signature = (await provider.request({
      method: "personal_sign",
      params: [message, address],
    })) as string;

    const verifyRes = await fetch("/api/auth/siwe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, signature }),
    });

    if (!verifyRes.ok) {
      const body = (await verifyRes.json().catch(() => ({}))) as {
        error?: string;
      };
      return { ok: false, error: body.error ?? "Verification failed" };
    }

    const body = (await verifyRes.json()) as { wallet: string };
    return { ok: true, wallet: body.wallet };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Sign-in failed",
    };
  }
}
