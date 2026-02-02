import Link from "next/link";
import { UserMenu } from "./UserMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/15 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          prefetch
          className="flex items-center gap-2 font-semibold"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 11.5L12 5l8 6.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 10.5V19a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-8.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 20v-5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-lg font-semibold tracking-tight text-emerald-700">
            bayut
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-zinc-700 md:flex">
          <Link href="#" className="hover:text-zinc-900">
            Find my Agent
          </Link>
          <Link href="/?addProperty=1" className="hover:text-zinc-900">
            Sell My Property
          </Link>
          <Link href="#" className="hover:text-zinc-900">
            New Projects
          </Link>
          <Link href="#" className="hover:text-zinc-900">
            Agents
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <UserMenu />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 md:hidden"
            aria-label="Menu"
          >
            <span className="h-4 w-4">≡</span>
          </button>
        </div>
      </div>
    </header>
  );
}
