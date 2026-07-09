import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Profile avatars can come from anywhere the owner points them (IPFS gateways,
    // ENS avatar records, arweave, etc.). We render them via <img> not next/image,
    // but allow remote patterns here in case we opt into next/image later.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [
      // Baseline security headers on every response.
      { source: "/:path*", headers: securityHeaders },
      // Public read API is designed to be consumed cross-origin by other ZAO
      // apps. Reads carry no credentials, so a wildcard origin is safe; writes
      // stay protected by the session cookie (never sent cross-site) or a
      // secret API-key header.
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PATCH, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, x-api-key, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
