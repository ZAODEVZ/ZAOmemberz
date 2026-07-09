import { ImageResponse } from "next/og";
import { isAddress } from "viem";
import { getProfileByWallet, getProfileByFid } from "@/lib/profiles";
import { shortAddress, initials, hueFrom } from "@/lib/format";

export const runtime = "nodejs";
export const alt = "ZAO ecosystem member profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Per-profile social share card. Falls back to a generic card if the profile
// can't be loaded (e.g. no DB), never crashing the request.
export default async function ProfileOg({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  let name = "ZAO member";
  let sub = "";
  let hue = 220;
  try {
    const p = isAddress(handle)
      ? await getProfileByWallet(handle)
      : await getProfileByFid(Number(handle));
    if (p) {
      name = p.displayName || p.ensName || shortAddress(p.walletAddress);
      sub = p.ensName ?? shortAddress(p.walletAddress);
      hue = hueFrom(p.walletAddress);
    }
  } catch {
    // fall through to generic card
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 40,
          padding: "80px",
          background:
            "radial-gradient(900px 500px at 20% -10%, #1a2350, #06070a 60%)",
          color: "#e9ecf3",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: 80,
              background: `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${
                (hue + 60) % 360
              } 70% 35%))`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            {initials(name === "ZAO member" ? null : name, handle)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 60, fontWeight: 900 }}>{name}</div>
            {sub && (
              <div style={{ fontSize: 30, color: "#8b93a7" }}>{sub}</div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "linear-gradient(135deg, #5b6dff, #22d3a0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 900,
              color: "#06070a",
            }}
          >
            Z
          </div>
          <div style={{ fontSize: 26, color: "#aab2c5", display: "flex" }}>
            <span>on&nbsp;ZAO</span>
            <span style={{ color: "#8b93a7" }}>memberz</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
