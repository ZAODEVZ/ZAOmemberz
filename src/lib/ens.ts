import { createPublicClient, http, type Address } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import { MAINNET_RPC_URL } from "@/lib/env";

/**
 * Live ENS resolution.
 *
 * ENS is a *verifiable on-chain fact*, so per the ZAOmemberz principle we never
 * present a stale cached copy as current — public views resolve fresh from
 * mainnet and stamp the time. Callers may persist the result to the profile's
 * `ens_name` cache purely to avoid fan-out on list views, but the timestamp
 * always travels with it.
 *
 * ENS lives on Ethereum mainnet even though ZAO Respect lives on Optimism.
 */

const client = createPublicClient({
  chain: mainnet,
  transport: http(MAINNET_RPC_URL),
});

export interface EnsResult {
  name: string | null;
  avatar: string | null;
  checkedAt: string; // ISO timestamp of when we resolved
}

/** Resolve the primary ENS name (and avatar) for an address, live. */
export async function resolveEns(address: string): Promise<EnsResult> {
  const checkedAt = new Date().toISOString();
  try {
    const name = await client.getEnsName({ address: address as Address });
    let avatar: string | null = null;
    if (name) {
      avatar = await client.getEnsAvatar({ name: normalize(name) });
    }
    return { name: name ?? null, avatar: avatar ?? null, checkedAt };
  } catch {
    // Resolution failure is non-fatal — the profile still renders, just
    // without a live ENS badge.
    return { name: null, avatar: null, checkedAt };
  }
}
