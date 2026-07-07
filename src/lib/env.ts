/**
 * Centralized environment access with helpful errors.
 *
 * Public (NEXT_PUBLIC_*) values are safe to inline into client bundles.
 * Everything else is server-only and must never be imported into a client
 * component.
 */

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing required environment variable: ${name}. See .env.example.`,
    );
  }
  return v;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

// ── Public (safe on the client) ─────────────────────────────────────────────
export const AUTH_DOMAIN = optional(
  "NEXT_PUBLIC_AUTH_DOMAIN",
  "localhost:3000",
);
export const AUTH_URL = optional(
  "NEXT_PUBLIC_AUTH_URL",
  "http://localhost:3000",
);
export const OP_RPC_URL = optional(
  "NEXT_PUBLIC_OP_RPC_URL",
  "https://mainnet.optimism.io",
);

// ── Server-only ─────────────────────────────────────────────────────────────
export const MAINNET_RPC_URL = optional(
  "MAINNET_RPC_URL",
  "https://eth.llamarpc.com",
);

export function sessionSecret(): Uint8Array {
  return new TextEncoder().encode(required("SESSION_SECRET"));
}
