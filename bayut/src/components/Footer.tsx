"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-zinc-200 bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-white"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white text-zinc-950">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M12 5l-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 5l6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              TOP
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://www.facebook.com/bayutuae"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1877F2] hover:bg-[#1877F2] hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M13.5 22v-8h2.7l.4-3H13.5V9.1c0-.9.3-1.6 1.7-1.6H16.7V4.8c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V11H7.5v3H10v8h3.5z" />
                </svg>
              </a>
              <a
                href="https://x.com/bayut"
                target="_blank"
                rel="noreferrer"
                aria-label="X"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-zinc-950 hover:bg-zinc-100"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18.7 3H21l-5.4 6.2L22 21h-5l-3.9-6-5.2 6H5.6l5.8-6.7L2 3h5.1l3.5 5.3L15.2 3h3.5zm-1 16h1.3L6.3 4.9H5L17.7 19z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/bayut-com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5zM3.5 9H6.5v12H3.5V9zm7 0h2.9v1.6h.04c.4-.8 1.4-1.7 3-1.7 3.2 0 3.8 2.1 3.8 4.9V21h-3v-6.2c0-1.5 0-3.4-2.1-3.4-2.1 0-2.4 1.6-2.4 3.3V21h-3V9z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/bayutuae"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#E4405F] hover:bg-[#E4405F] hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 4.3a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4zm0 2a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4zM17.9 6.1a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/channel/UCiImTXBgvMqM3vC20Boel8Q"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#FF0000] hover:bg-[#FF0000] hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.8 4.6 12 4.6 12 4.6s-5.8 0-7.5.5A3 3 0 0 0 2.4 7.2 31 31 0 0 0 2 12a31 31 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.7.5 7.5.5 7.5.5s5.8 0 7.5-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z" />
                </svg>
              </a>

              <a
                href="https://apps.apple.com/us/app/bayut-uae-property-search/id923263211"
                target="_blank"
                rel="noreferrer"
                className="ml-1 inline-flex h-9 items-center rounded-xl border border-white/20 bg-black px-3 text-xs font-semibold text-white hover:bg-zinc-900"
              >
                <span className="mr-2 inline-flex">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M16.6 13.3c0 2.8 2.5 3.8 2.5 3.8s-1.9 5.5-4.5 5.5c-1.2 0-2.1-.8-3.4-.8-1.4 0-2.4.8-3.7.8-2.3 0-5-5.3-5-9.3 0-3.9 2.5-6 4.9-6 1.2 0 2.3.8 3.1.8.8 0 2.1-.9 3.6-.9.6 0 2.7.1 4 2.1-.1.1-2.4 1.4-2.4 4zM14.2 3.3c.8-1 1.4-2.4 1.2-3.3-1.2.1-2.6.8-3.4 1.8-.8.9-1.4 2.3-1.2 3.2 1.2.1 2.6-.7 3.4-1.7z" />
                  </svg>
                </span>
                Download on the App Store
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.bayut.bayutapp&pli=1"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center rounded-xl border border-white/20 bg-black px-3 text-xs font-semibold text-white hover:bg-zinc-900"
              >
                <span className="mr-2 inline-flex">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M3.6 2.8l10.9 9.2-2.8 2.7L3.6 2.8zm-.9 1.8v14.8c0 .5.2 1 .6 1.3l8.2-8-8.8-8.1zM20.1 12l-2.6-2.2-3 2.9 3 2.9 2.6-2.2c.6-.5.6-1.2 0-1.4zM3.6 21.2l10.9-9.2-2.8-2.7-8.1 11.9z" />
                  </svg>
                </span>
                Get it on Google Play
              </a>
              <a
                href="https://appgallery.huawei.com/app/C100083653"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center rounded-xl border border-white/20 bg-black px-3 text-xs font-semibold text-white hover:bg-zinc-900"
              >
                <span className="mr-2 inline-flex">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M5 5h14v14H5V5zm2 2v10h10V7H7zm1.5 1.5H11v6H8.5v-6zm4.5 0H15.5v6H13v-6z" />
                  </svg>
                </span>
                Explore it on AppGallery
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/75">
            <Link href="#" className="hover:text-white">
              ABOUT US
            </Link>
            <span className="text-white/25">|</span>
            <Link href="#" className="hover:text-white">
              CAREERS
            </Link>
            <span className="text-white/25">|</span>
            <Link href="#" className="hover:text-white">
              CONTACT US
            </Link>
            <span className="text-white/25">|</span>
            <Link href="#" className="hover:text-white">
              TERMS &amp; PRIVACY POLICY
            </Link>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
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
              <span className="text-sm font-semibold text-white">bayut</span>
            </div>
            <p className="text-xs text-white/50">
              © {new Date().getFullYear()} bayut.com clone
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
