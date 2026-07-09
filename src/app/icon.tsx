import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Generated favicon: the "Z" mark on the brand gradient.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 7,
          background: "linear-gradient(135deg, #5b6dff, #22d3a0)",
          color: "#06070a",
          fontSize: 22,
          fontWeight: 900,
        }}
      >
        Z
      </div>
    ),
    size,
  );
}
