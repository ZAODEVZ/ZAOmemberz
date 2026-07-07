import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ZAOmemberz — The ZAO Ecosystem Directory",
    template: "%s · ZAOmemberz",
  },
  description:
    "The shared identity and profile service for the ZAO ecosystem. A public directory of members, anchored to their wallets.",
  openGraph: {
    title: "ZAOmemberz",
    description:
      "The shared identity layer for the ZAO ecosystem — a public directory of members.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
