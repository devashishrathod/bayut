"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CategoryType,
  PropertiesMetadata,
  RentFrequency,
} from "../types/property";

export type PropertyFiltersState = {
  purpose: "rent" | "sale";
  q?: string;
  city?: string;
  community?: string;
  categoryType?: CategoryType;
  subCategoryIds?: string[];
  bedrooms?: number[];
  bathrooms?: number[];
  minAreaSqft?: number;
  maxAreaSqft?: number;
  minPrice?: number;
  maxPrice?: number;
  exactPrice?: number;
  rentFrequency?: RentFrequency;
  sort?: "newest" | "oldest";
  page: number;
  limit: number;
};

function formatBeds(list: number[] | undefined): string {
  if (!list?.length) return "Any Beds";
  const normalized = [...new Set(list)].sort((a, b) => a - b);
  const parts = normalized.map((n) => (n === 0 ? "Studio" : `${n}+ Beds`));
  return parts.join(", ");
}

function formatBaths(list: number[] | undefined): string {
  if (!list?.length) return "Any Baths";
  const normalized = [...new Set(list)].sort((a, b) => a - b);
  const parts = normalized.map((n) => `${n}+ Baths`);
  return parts.join(", ");
}

function toNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return undefined;
  return Math.max(0, Math.floor(n));
}

export function PropertyFiltersBar({
  metadata,
  value,
  loading,
  onChange,
  onSubmit,
  onClear,
}: {
  metadata: PropertiesMetadata;
  value: PropertyFiltersState;
  loading: boolean;
  onChange: (next: PropertyFiltersState) => void;
  onSubmit: () => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState<null | "type" | "beds" | "area" | "price">(
    null,
  );
  const rootRef = useRef<HTMLDivElement | null>(null);

  const availableSubCats = useMemo(() => {
    if (value.categoryType) {
      const match = metadata.categories.find(
        (c) => c.type === value.categoryType,
      );
      return match?.subCategories ?? [];
    }
    const all = metadata.categories.flatMap((c) => c.subCategories);
    const seen = new Set<string>();
    return all.filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [metadata.categories, value.categoryType]);

  const selectedSubCatLabels = useMemo(() => {
    const selected = new Set(value.subCategoryIds ?? []);
    if (!selected.size) return "Property type";
    const map = new Map(availableSubCats.map((s) => [s.id, s.name]));
    const names = [...selected]
      .map((id) => map.get(id))
      .filter(Boolean) as string[];
    if (!names.length) return "Property type";
    if (names.length === 1) return names[0] as string;
    return `${names.length} selected`;
  }, [availableSubCats, value.subCategoryIds]);

  const bedsLabel = useMemo(() => {
    const beds = value.bedrooms;
    const baths = value.bathrooms;
    if (!beds?.length && !baths?.length) return "Beds & Baths";
    return `${formatBeds(beds)} • ${formatBaths(baths)}`;
  }, [value.bathrooms, value.bedrooms]);

  const areaLabel = useMemo(() => {
    if (value.minAreaSqft === undefined && value.maxAreaSqft === undefined)
      return "Area (sqft)";
    const min = value.minAreaSqft ?? "Any";
    const max = value.maxAreaSqft ?? "Any";
    return `${min} - ${max}`;
  }, [value.maxAreaSqft, value.minAreaSqft]);

  const priceLabel = useMemo(() => {
    if (value.exactPrice !== undefined)
      return `AED ${value.exactPrice.toLocaleString()}`;
    if (value.minPrice === undefined && value.maxPrice === undefined)
      return "Price (AED)";
    const min = value.minPrice?.toLocaleString() ?? "Any";
    const max = value.maxPrice?.toLocaleString() ?? "Any";
    return `${min} - ${max}`;
  }, [value.exactPrice, value.maxPrice, value.minPrice]);

  const showArea = value.categoryType === "commercial";

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      value.community ||
      value.city ||
      value.q ||
      value.categoryType ||
      (value.subCategoryIds && value.subCategoryIds.length) ||
      (value.bedrooms && value.bedrooms.length) ||
      (value.bathrooms && value.bathrooms.length) ||
      value.minPrice !== undefined ||
      value.maxPrice !== undefined ||
      value.exactPrice !== undefined ||
      value.minAreaSqft !== undefined ||
      value.maxAreaSqft !== undefined ||
      value.rentFrequency !== undefined ||
      value.sort !== undefined,
    );
  }, [
    value.bathrooms,
    value.bedrooms,
    value.categoryType,
    value.city,
    value.community,
    value.exactPrice,
    value.maxAreaSqft,
    value.maxPrice,
    value.minAreaSqft,
    value.minPrice,
    value.q,
    value.rentFrequency,
    value.sort,
    value.subCategoryIds,
  ]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
    }

    function onPointerDown(e: MouseEvent) {
      const root = rootRef.current;
      if (!root) return;
      if (root.contains(e.target as Node)) return;
      setOpen(null);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative z-[60] w-full">
      <div className="rounded-xl border border-zinc-200 bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-1 rounded-md bg-zinc-100 p-1">
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    purpose: "sale",
                    page: 1,
                    rentFrequency: undefined,
                  })
                }
                className={
                  value.purpose === "sale"
                    ? "h-9 rounded-md bg-white px-4 text-sm font-semibold text-zinc-900 shadow-sm"
                    : "h-9 rounded-md px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-200"
                }
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...value, purpose: "rent", page: 1 })}
                className={
                  value.purpose === "rent"
                    ? "h-9 rounded-md bg-white px-4 text-sm font-semibold text-zinc-900 shadow-sm"
                    : "h-9 rounded-md px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-200"
                }
              >
                Rent
              </button>
            </div>

            <div className="relative w-full min-w-0 flex-1">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M12 22s7-5.5 7-12a7 7 0 1 0-14 0c0 6.5 7 12 7 12Z" />
                  <path d="M12 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                </svg>
              </div>
              <input
                value={value.community ?? ""}
                onChange={(e) =>
                  onChange({
                    ...value,
                    community: e.target.value || undefined,
                    page: 1,
                  })
                }
                aria-label="Location"
                placeholder="Enter location"
                className="h-11 w-full min-w-0 rounded-md border border-zinc-200 bg-white pl-11 pr-4 text-base text-zinc-900 placeholder:text-zinc-500 outline-none ring-emerald-200 focus:ring-4 sm:text-sm"
              />
            </div>

            <div className="w-full sm:w-[160px]">
              <button
                type="button"
                onClick={onSubmit}
                disabled={loading}
                className={
                  loading
                    ? "h-11 w-full rounded-md bg-zinc-200 px-6 text-sm font-semibold text-zinc-500"
                    : "h-11 w-full rounded-md bg-emerald-600 px-6 text-sm font-semibold text-white hover:bg-emerald-700"
                }
              >
                {loading ? "Searching…" : "Search"}
              </button>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={onClear}
                  className="mt-2 w-full text-right text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={value.categoryType ?? ""}
              onChange={(e) => {
                const next = (e.target.value as CategoryType) || undefined;
                onChange({
                  ...value,
                  categoryType: next,
                  subCategoryIds: undefined,
                  bedrooms: next === "commercial" ? undefined : value.bedrooms,
                  bathrooms:
                    next === "commercial" ? undefined : value.bathrooms,
                  minAreaSqft:
                    next === "commercial" ? value.minAreaSqft : undefined,
                  maxAreaSqft:
                    next === "commercial" ? value.maxAreaSqft : undefined,
                  page: 1,
                });
              }}
              className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none ring-emerald-200 focus:ring-4"
            >
              <option value="">All</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
            </select>

            {value.categoryType ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpen(open === "type" ? null : "type")}
                  className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                >
                  {selectedSubCatLabels}
                </button>

                {open === "type" ? (
                  <div className="absolute left-0 top-[calc(100%+0.5rem)] z-[200] w-[min(420px,calc(100vw-2rem))] rounded-2xl border border-zinc-200 bg-white p-3 shadow-2xl">
                    <div className="text-xs font-semibold text-zinc-700">
                      Property type
                    </div>
                    <div className="mt-2 max-h-64 overflow-auto">
                      {availableSubCats.map((s) => {
                        const checked = (value.subCategoryIds ?? []).includes(
                          s.id,
                        );
                        return (
                          <label
                            key={s.id}
                            className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 hover:bg-zinc-50"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const prev = new Set(
                                  value.subCategoryIds ?? [],
                                );
                                if (prev.has(s.id)) prev.delete(s.id);
                                else prev.add(s.id);
                                const nextIds = [...prev];
                                onChange({
                                  ...value,
                                  subCategoryIds: nextIds.length
                                    ? nextIds
                                    : undefined,
                                  page: 1,
                                });
                              }}
                            />
                            <span className="text-sm text-zinc-800">
                              {s.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onChange({
                            ...value,
                            subCategoryIds: undefined,
                            page: 1,
                          })
                        }
                        className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 hover:bg-zinc-50"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpen(null)}
                        className="h-9 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpen(
                    open === (showArea ? "area" : "beds")
                      ? null
                      : showArea
                        ? "area"
                        : "beds",
                  )
                }
                className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
              >
                {showArea ? areaLabel : bedsLabel}
              </button>

              {open === "beds" ? (
                <div className="absolute left-0 top-[calc(100%+0.5rem)] z-[200] w-[min(420px,calc(100vw-2rem))] rounded-2xl border border-zinc-200 bg-white p-3 shadow-2xl">
                  <div className="text-xs font-semibold text-zinc-700">
                    Beds
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[undefined, 0, 1, 2, 3, 4, 5].map((b) => {
                      const label =
                        b === undefined ? "Any" : b === 0 ? "Studio" : `${b}+`;
                      const selected = new Set(value.bedrooms ?? []);
                      const active =
                        b === undefined ? selected.size === 0 : selected.has(b);
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            if (b === undefined) {
                              onChange({
                                ...value,
                                bedrooms: undefined,
                                page: 1,
                              });
                              return;
                            }
                            const next = new Set(value.bedrooms ?? []);
                            if (next.has(b)) next.delete(b);
                            else next.add(b);
                            const arr = [...next];
                            onChange({
                              ...value,
                              bedrooms: arr.length ? arr : undefined,
                              page: 1,
                            });
                          }}
                          className={
                            active
                              ? "h-9 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white"
                              : "h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 hover:bg-zinc-50"
                          }
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 text-xs font-semibold text-zinc-700">
                    Baths
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[undefined, 1, 2, 3, 4, 5].map((b) => {
                      const label = b === undefined ? "Any" : `${b}+`;
                      const selected = new Set(value.bathrooms ?? []);
                      const active =
                        b === undefined ? selected.size === 0 : selected.has(b);
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            if (b === undefined) {
                              onChange({
                                ...value,
                                bathrooms: undefined,
                                page: 1,
                              });
                              return;
                            }
                            const next = new Set(value.bathrooms ?? []);
                            if (next.has(b)) next.delete(b);
                            else next.add(b);
                            const arr = [...next];
                            onChange({
                              ...value,
                              bathrooms: arr.length ? arr : undefined,
                              page: 1,
                            });
                          }}
                          className={
                            active
                              ? "h-9 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white"
                              : "h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 hover:bg-zinc-50"
                          }
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...value,
                          bedrooms: undefined,
                          bathrooms: undefined,
                          page: 1,
                        })
                      }
                      className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 hover:bg-zinc-50"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(null)}
                      className="h-9 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : null}

              {open === "area" ? (
                <div className="absolute left-0 top-[calc(100%+0.5rem)] z-[200] w-[min(420px,calc(100vw-2rem))] rounded-2xl border border-zinc-200 bg-white p-3 shadow-2xl">
                  <div className="text-xs font-semibold text-zinc-700">
                    Area (sqft)
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <input
                      value={value.minAreaSqft ?? ""}
                      onChange={(e) =>
                        onChange({
                          ...value,
                          minAreaSqft: toNumber(e.target.value),
                          page: 1,
                        })
                      }
                      placeholder="Min"
                      className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none ring-emerald-200 focus:ring-4"
                    />
                    <input
                      value={value.maxAreaSqft ?? ""}
                      onChange={(e) =>
                        onChange({
                          ...value,
                          maxAreaSqft: toNumber(e.target.value),
                          page: 1,
                        })
                      }
                      placeholder="Max"
                      className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none ring-emerald-200 focus:ring-4"
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...value,
                          minAreaSqft: undefined,
                          maxAreaSqft: undefined,
                          page: 1,
                        })
                      }
                      className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 hover:bg-zinc-50"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(null)}
                      className="h-9 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen(open === "price" ? null : "price")}
                className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
              >
                {priceLabel}
              </button>

              {open === "price" ? (
                <div className="absolute left-0 top-[calc(100%+0.5rem)] z-[200] w-[min(460px,calc(100vw-2rem))] rounded-2xl border border-zinc-200 bg-white p-3 shadow-2xl">
                  <div className="text-xs font-semibold text-zinc-700">
                    Price (AED)
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <input
                      value={value.minPrice ?? ""}
                      onChange={(e) => {
                        const minPrice = toNumber(e.target.value);
                        onChange({
                          ...value,
                          minPrice,
                          exactPrice: undefined,
                          page: 1,
                        });
                      }}
                      placeholder="Min"
                      className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none ring-emerald-200 focus:ring-4"
                    />
                    <input
                      value={value.maxPrice ?? ""}
                      onChange={(e) => {
                        const maxPrice = toNumber(e.target.value);
                        onChange({
                          ...value,
                          maxPrice,
                          exactPrice: undefined,
                          page: 1,
                        });
                      }}
                      placeholder="Max"
                      className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none ring-emerald-200 focus:ring-emerald-200 focus:ring-4"
                    />
                    <input
                      value={value.exactPrice ?? ""}
                      onChange={(e) =>
                        onChange({
                          ...value,
                          exactPrice: toNumber(e.target.value),
                          minPrice: undefined,
                          maxPrice: undefined,
                          page: 1,
                        })
                      }
                      placeholder="Exact"
                      className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none ring-emerald-200 focus:ring-4"
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...value,
                          minPrice: undefined,
                          maxPrice: undefined,
                          exactPrice: undefined,
                          page: 1,
                        })
                      }
                      className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 hover:bg-zinc-50"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(null)}
                      className="h-9 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {value.purpose === "rent" ? (
              <select
                value={value.rentFrequency ?? ""}
                onChange={(e) =>
                  onChange({
                    ...value,
                    rentFrequency:
                      (e.target.value as RentFrequency) || undefined,
                    page: 1,
                  })
                }
                className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none ring-emerald-200 focus:ring-4"
              >
                <option value="">Any frequency</option>
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            ) : null}

            <select
              value={value.sort ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  sort: (e.target.value as "newest" | "oldest") || undefined,
                  page: 1,
                })
              }
              className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none ring-emerald-200 focus:ring-4"
            >
              <option value="">Sort</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
