import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-ink-950/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-signal-500 text-sm font-black text-ink-950">
            Z
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            ZAO<span className="text-mist-400">memberz</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 text-mist-300 transition hover:bg-white/5 hover:text-mist-100"
          >
            Directory
          </Link>
          <Link
            href="/me"
            className="rounded-lg bg-white/5 px-3 py-1.5 font-medium text-mist-100 ring-1 ring-white/10 transition hover:bg-white/10"
          >
            Edit my profile
          </Link>
        </nav>
      </div>
    </header>
  );
}
