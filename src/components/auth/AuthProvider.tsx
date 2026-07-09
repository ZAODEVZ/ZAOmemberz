"use client";

import { AuthKitProvider } from "@farcaster/auth-kit";
import "@farcaster/auth-kit/styles.css";

/**
 * Wraps the self-service editor in Farcaster AuthKit so the Sign-In-With-
 * Farcaster button can drive the relay/QR flow. Config comes from public env.
 */
const config = {
  domain:
    process.env.NEXT_PUBLIC_AUTH_DOMAIN ?? "localhost:3000",
  siweUri:
    (process.env.NEXT_PUBLIC_AUTH_URL ?? "http://localhost:3000") + "/me",
  rpcUrl:
    process.env.NEXT_PUBLIC_OP_RPC_URL ?? "https://mainnet.optimism.io",
  relay: "https://relay.farcaster.xyz",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthKitProvider config={config}>{children}</AuthKitProvider>;
}
