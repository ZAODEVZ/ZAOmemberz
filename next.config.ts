import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Profile avatars can come from anywhere the owner points them (IPFS gateways,
    // ENS avatar records, arweave, etc.). We render them via <img> not next/image,
    // but allow remote patterns here in case we opt into next/image later.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
