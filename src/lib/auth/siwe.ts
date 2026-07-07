import { SiweMessage } from "siwe";
import {
  recoverMessageAddress,
  createPublicClient,
  http,
  isAddressEqual,
  type Address,
} from "viem";
import { mainnet, optimism } from "viem/chains";
import { AUTH_DOMAIN, MAINNET_RPC_URL, OP_RPC_URL } from "@/lib/env";

/**
 * Sign-In-With-Ethereum verification.
 *
 * Ported to this repo fresh (the reference implementation in
 * bettercallzaal/fractalbotjuly2026 web/lib/siwe.ts is not reachable from this
 * service's repo scope) following the exact same pattern: the `siwe` package
 * parses/validates the EIP-4361 message envelope, and viem verifies the
 * signature — EOA via `recoverMessageAddress`, smart-contract wallets via an
 * on-chain ERC-1271 check.
 */

export interface SiweVerifyResult {
  ok: boolean;
  address?: string; // lowercased
  error?: string;
}

/**
 * @param message   the raw EIP-4361 message string the user signed
 * @param signature the hex signature
 * @param expectedNonce the nonce we previously issued and stored server-side
 */
export async function verifySiwe(
  message: string,
  signature: string,
  expectedNonce: string,
): Promise<SiweVerifyResult> {
  let parsed: SiweMessage;
  try {
    parsed = new SiweMessage(message);
  } catch {
    return { ok: false, error: "Malformed SIWE message" };
  }

  // ── Envelope checks: bind the signature to *our* domain + nonce + time ──
  if (parsed.nonce !== expectedNonce) {
    return { ok: false, error: "Nonce mismatch" };
  }
  if (parsed.domain !== AUTH_DOMAIN) {
    return { ok: false, error: "Domain mismatch" };
  }
  const now = Date.now();
  if (parsed.expirationTime && Date.parse(parsed.expirationTime) < now) {
    return { ok: false, error: "Message expired" };
  }
  if (parsed.notBefore && Date.parse(parsed.notBefore) > now) {
    return { ok: false, error: "Message not yet valid" };
  }

  const claimed = parsed.address as Address;
  const sig = signature as `0x${string}`;

  // ── EOA path: recover the signer and compare ──
  try {
    const recovered = await recoverMessageAddress({ message, signature: sig });
    if (isAddressEqual(recovered, claimed)) {
      return { ok: true, address: claimed.toLowerCase() };
    }
  } catch {
    // fall through to 1271
  }

  // ── Smart-contract wallet path: ERC-1271 isValidSignature on the message's
  // declared chain (mainnet or optimism supported). ──
  try {
    const chain = parsed.chainId === optimism.id ? optimism : mainnet;
    const rpc = chain.id === optimism.id ? OP_RPC_URL : MAINNET_RPC_URL;
    const client = createPublicClient({ chain, transport: http(rpc) });
    const valid = await client.verifyMessage({
      address: claimed,
      message,
      signature: sig,
    });
    if (valid) return { ok: true, address: claimed.toLowerCase() };
  } catch {
    // ignore — treated as invalid below
  }

  return { ok: false, error: "Signature verification failed" };
}
