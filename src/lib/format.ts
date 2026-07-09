/** Truncate an 0x address to `0x1234…abcd`. */
export function shortAddress(addr: string, lead = 6, tail = 4): string {
  if (!addr) return "";
  if (addr.length <= lead + tail) return addr;
  return `${addr.slice(0, lead)}…${addr.slice(-tail)}`;
}

/** Initials from a display name or address, for avatar fallbacks. */
export function initials(name: string | null, wallet: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return wallet.slice(2, 4).toUpperCase();
}

/** Deterministic hue from a string (for avatar gradient fallbacks). */
export function hueFrom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) % 360;
  }
  return h;
}
