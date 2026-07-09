import { ImageResponse } from "next/og";
import {
  RESPECT_HOLDERS,
  CHAIN,
  weeksRunning,
} from "@/lib/ecosystem-facts";

export const runtime = "nodejs";
export const alt = "ZAOmemberz — the ZAO ecosystem directory";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social share card for the home directory. Uses only verified stats.
export default function OgImage() {
  const weeks = weeksRunning();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(900px 500px at 30% -10%, #1a2350, #06070a 60%)",
          color: "#e9ecf3",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #5b6dff, #22d3a0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 900,
              color: "#06070a",
            }}
          >
            Z
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, display: "flex" }}>
            <span>ZAO</span>
            <span style={{ color: "#8b93a7" }}>memberz</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 68, fontWeight: 900, lineHeight: 1.05 }}>
            The people building
          </div>
          <div
            style={{
              fontSize: 68,
              fontWeight: 900,
              lineHeight: 1.05,
              background: "linear-gradient(90deg, #7c8cff, #4ee6b8)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            The ZAO.
          </div>
        </div>

        <div style={{ display: "flex", gap: 48, fontSize: 26 }}>
          <Stat value={`${RESPECT_HOLDERS.unique}`} label="Respect holders" />
          <Stat value={`~${weeks}`} label="Weeks, unbroken" />
          <Stat value={CHAIN} label="On-chain" />
        </div>
      </div>
    ),
    size,
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 44, fontWeight: 900, color: "#e9ecf3" }}>
        {value}
      </div>
      <div style={{ fontSize: 22, color: "#8b93a7" }}>{label}</div>
    </div>
  );
}
