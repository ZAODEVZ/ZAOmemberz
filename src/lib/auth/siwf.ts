import { createAppClient, viemConnector } from "@farcaster/auth-client";
import { AUTH_DOMAIN, OP_RPC_URL } from "@/lib/env";

/**
 * Sign-In-With-Farcaster verification (server side).
 *
 * This is the primary end-user login. The client uses Farcaster AuthKit to
 * produce a Sign-In-With-Farcaster message + signature (approved in the user's
 * Farcaster app / Warpcast). Here we verify it against the Farcaster ID
 * Registry on Optimism and extract the FID and custody/verified address.
 *
 * Mirrors the established ZAOOS signer pattern: the app client reads the
 * ID Registry via a viem connector on Optimism, and we bind the message to our
 * own domain + server-issued nonce.
 */

const appClient = createAppClient({
  ethereum: viemConnector({ rpcUrl: OP_RPC_URL }),
});

export interface SiwfVerifyResult {
  ok: boolean;
  fid?: number;
  // The custody/verified address the signature resolves to (lowercased).
  address?: string;
  error?: string;
}

export async function verifySiwf(
  message: string,
  signature: `0x${string}`,
  expectedNonce: string,
): Promise<SiwfVerifyResult> {
  try {
    const result = await appClient.verifySignInMessage({
      message,
      signature,
      domain: AUTH_DOMAIN,
      nonce: expectedNonce,
    });

    if (!result.success) {
      return { ok: false, error: "Farcaster signature verification failed" };
    }

    const fid = result.fid;
    // `data.address` is the address that produced the SIWF signature.
    const address =
      typeof result.data?.address === "string"
        ? result.data.address.toLowerCase()
        : undefined;

    if (!fid) {
      return { ok: false, error: "No FID in verified message" };
    }

    return { ok: true, fid, address };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Verification error",
    };
  }
}
