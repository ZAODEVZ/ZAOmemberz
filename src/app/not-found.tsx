import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <main className="min-h-dvh">
      <SiteHeader />
      <div className="mx-auto flex max-w-6xl flex-col items-center px-5 py-32 text-center">
        <p className="text-7xl font-black tracking-tight text-mist-100">404</p>
        <h1 className="mt-3 text-xl font-semibold text-mist-200">
          Nothing here.
        </h1>
        <p className="mt-2 max-w-sm text-sm text-mist-400">
          This member or page doesn&apos;t exist on ZAOmemberz.
        </p>
        <Link
          href="/"
          className="mt-7 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Back to the directory
        </Link>
      </div>
    </main>
  );
}
