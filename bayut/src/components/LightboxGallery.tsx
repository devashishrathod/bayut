"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

export function LightboxGallery({
  title,
  images,
}: {
  title: string;
  images: string[];
}) {
  const uniqueImages = useMemo(() => {
    const out: string[] = [];
    for (const url of images) {
      if (!url) continue;
      if (out.includes(url)) continue;
      out.push(url);
    }
    return out;
  }, [images]);

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);

  const current =
    openIndex === null
      ? null
      : (uniqueImages[openIndex] ?? uniqueImages[0] ?? null);

  const close = useCallback(() => {
    setOpenIndex(null);
    setZoomed(false);
  }, []);

  const next = useCallback(() => {
    setOpenIndex((idx) => {
      if (idx === null) return idx;
      const n = uniqueImages.length;
      if (!n) return idx;
      return (idx + 1) % n;
    });
    setZoomed(false);
  }, [uniqueImages.length]);

  const prev = useCallback(() => {
    setOpenIndex((idx) => {
      if (idx === null) return idx;
      const n = uniqueImages.length;
      if (!n) return idx;
      return (idx - 1 + n) % n;
    });
    setZoomed(false);
  }, [uniqueImages.length]);

  useEffect(() => {
    if (openIndex === null) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openIndex, close, next, prev]);

  if (uniqueImages.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpenIndex(0)}
        className="relative block aspect-[16/10] w-full overflow-hidden"
      >
        <Image
          src={uniqueImages[0]}
          alt={title}
          fill
          priority
          className="object-cover transition-transform duration-300 hover:scale-[1.02]"
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
      </button>

      {uniqueImages.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto p-3">
          {uniqueImages.slice(0, 12).map((url, idx) => (
            <button
              key={url}
              type="button"
              onClick={() => setOpenIndex(idx)}
              className="relative h-20 w-28 flex-none overflow-hidden rounded-xl border border-zinc-200"
            >
              <Image
                src={url}
                alt={title}
                fill
                className="object-cover"
                sizes="120px"
              />
            </button>
          ))}
        </div>
      ) : null}

      {openIndex !== null && current ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={close}
            className="absolute inset-0 cursor-zoom-out"
            aria-label="Close"
          />

          <div className="relative z-10 w-full max-w-5xl">
            <div className="flex items-center justify-between gap-3">
              <div className="truncate text-sm font-semibold text-white">
                {title}
              </div>
              <button
                type="button"
                onClick={close}
                className="inline-flex h-9 items-center justify-center rounded-xl bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/15"
              >
                Close
              </button>
            </div>

            <div className="relative mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black">
              <button
                type="button"
                onClick={() => setZoomed((z) => !z)}
                className="relative block h-[65vh] w-full"
                aria-label="Toggle zoom"
              >
                <Image
                  src={current}
                  alt={title}
                  fill
                  className={
                    zoomed
                      ? "object-contain transition-transform duration-200 scale-[1.6] cursor-zoom-out"
                      : "object-contain transition-transform duration-200 cursor-zoom-in"
                  }
                  sizes="(max-width: 1024px) 100vw, 1024px"
                />
              </button>

              {uniqueImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/15"
                    aria-label="Previous"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/15"
                    aria-label="Next"
                  >
                    ›
                  </button>
                </>
              ) : null}
            </div>

            <div className="mt-3 text-center text-xs text-white/70">
              Click image to {zoomed ? "zoom out" : "zoom in"}. Use ← → keys to
              navigate.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
