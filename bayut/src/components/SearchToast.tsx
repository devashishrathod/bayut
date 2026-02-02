'use client';

import { useEffect } from 'react';

export function SearchToast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = window.setTimeout(() => onClose(), 4500);
    return () => window.clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed left-1/2 top-5 z-[60] w-[min(620px,calc(100%-2rem))] -translate-x-1/2">
      <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur">
        <div className="mt-0.5 inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-100">
          <span className="text-sm font-bold">!</span>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-900">No properties found</div>
          <div className="mt-0.5 text-sm text-zinc-600">{message}</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
