'use client';

import { useMemo } from 'react';

export function Pagination({
  page,
  limit,
  total,
  onPageChange,
}: {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const pages = useMemo(() => {
    const current = Math.min(Math.max(1, page), totalPages);
    const windowSize = 5;
    const half = Math.floor(windowSize / 2);

    let start = Math.max(1, current - half);
    let end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);

    const items: Array<number | 'ellipsis'> = [];
    if (start > 1) {
      items.push(1);
      if (start > 2) items.push('ellipsis');
    }
    for (let p = start; p <= end; p += 1) items.push(p);
    if (end < totalPages) {
      if (end < totalPages - 1) items.push('ellipsis');
      items.push(totalPages);
    }
    return items;
  }, [page, totalPages]);

  if (totalPages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={!canPrev}
        className={
          canPrev
            ? 'h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 hover:bg-zinc-50'
            : 'h-9 cursor-not-allowed rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-400'
        }
      >
        Prev
      </button>

      {pages.map((p, idx) =>
        p === 'ellipsis' ? (
          <span key={`e-${idx}`} className="px-2 text-sm text-zinc-500">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={
              p === page
                ? 'h-9 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white'
                : 'h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 hover:bg-zinc-50'
            }
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={!canNext}
        className={
          canNext
            ? 'h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 hover:bg-zinc-50'
            : 'h-9 cursor-not-allowed rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-400'
        }
      >
        Next
      </button>
    </nav>
  );
}
