import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { MeClient } from "./MeClient";

export const metadata: Metadata = { title: "Edit my profile" };
export const dynamic = "force-dynamic";

export default function MePage() {
  return (
    <main className="min-h-dvh">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-5 py-12 sm:py-20">
        <MeClient />
      </div>
    </main>
  );
}
