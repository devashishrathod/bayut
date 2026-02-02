"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  PropertiesMetadata,
  Property,
  RentFrequency,
} from "../types/property";
import { apiGet } from "../lib/api";
import { PropertyCard } from "./PropertyCard";
import { SearchToast } from "./SearchToast";
import { Pagination } from "./Pagination";
import {
  PropertyFiltersBar,
  type PropertyFiltersState,
} from "./PropertyFiltersBar";

type ListResponse = {
  items: Property[];
  total: number;
  page: number;
  limit: number;
};

function parseNumber(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

function parseIntSafe(v: string | null): number | undefined {
  const n = parseNumber(v);
  if (n === undefined) return undefined;
  return Math.floor(n);
}

function parseCsvNumbers(v: string | null): number[] | undefined {
  if (!v) return undefined;
  const items = v
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n >= 0)
    .map((n) => Math.floor(n));
  const unique = [...new Set(items)];
  return unique.length ? unique : undefined;
}

function parseCsv(v: string | null): string[] | undefined {
  if (!v) return undefined;
  const items = v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length ? items : undefined;
}

function buildQueryFromState(state: PropertyFiltersState) {
  const params = new URLSearchParams();
  params.set("purpose", state.purpose);
  if (state.q) params.set("q", state.q);
  if (state.city) params.set("city", state.city);
  if (state.community) params.set("community", state.community);
  if (state.categoryType) params.set("categoryType", state.categoryType);
  if (state.subCategoryIds?.length)
    params.set("subCategoryIds", state.subCategoryIds.join(","));
  if (state.bedrooms?.length) params.set("bedrooms", state.bedrooms.join(","));
  if (state.bathrooms?.length)
    params.set("bathrooms", state.bathrooms.join(","));
  if (state.minAreaSqft !== undefined)
    params.set("minAreaSqft", String(state.minAreaSqft));
  if (state.maxAreaSqft !== undefined)
    params.set("maxAreaSqft", String(state.maxAreaSqft));
  if (state.minPrice !== undefined)
    params.set("minPrice", String(state.minPrice));
  if (state.maxPrice !== undefined)
    params.set("maxPrice", String(state.maxPrice));
  if (state.exactPrice !== undefined)
    params.set("exactPrice", String(state.exactPrice));
  if (state.rentFrequency) params.set("rentFrequency", state.rentFrequency);
  if (state.sort) params.set("sort", state.sort);
  params.set("page", String(state.page));
  params.set("limit", String(state.limit));
  return params;
}

function stateFromParams(sp: URLSearchParams): PropertyFiltersState {
  const purpose = (sp.get("purpose") as "rent" | "sale" | null) ?? "sale";

  return {
    purpose,
    q: sp.get("q") ?? undefined,
    city: sp.get("city") ?? undefined,
    community: sp.get("community") ?? undefined,
    categoryType:
      (sp.get("categoryType") as "residential" | "commercial" | null) ??
      undefined,
    subCategoryIds: parseCsv(sp.get("subCategoryIds")),
    bedrooms: parseCsvNumbers(sp.get("bedrooms")),
    bathrooms: parseCsvNumbers(sp.get("bathrooms")),
    minAreaSqft: parseIntSafe(sp.get("minAreaSqft")),
    maxAreaSqft: parseIntSafe(sp.get("maxAreaSqft")),
    minPrice: parseIntSafe(sp.get("minPrice")),
    maxPrice: parseIntSafe(sp.get("maxPrice")),
    exactPrice: parseIntSafe(sp.get("exactPrice")),
    rentFrequency:
      (sp.get("rentFrequency") as RentFrequency | null) ?? undefined,
    sort: (sp.get("sort") as "newest" | "oldest" | null) ?? undefined,
    page: parseIntSafe(sp.get("page")) ?? 1,
    limit: parseIntSafe(sp.get("limit")) ?? 20,
  };
}

export function PropertiesResultsClient({
  metadata,
}: {
  metadata: PropertiesMetadata;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ListResponse | null>(null);

  const currentState = useMemo(() => {
    const sp = new URLSearchParams(searchParams.toString());
    return stateFromParams(sp);
  }, [searchParams]);

  function replaceUrl(next: PropertyFiltersState) {
    const qs = buildQueryFromState(next);
    router.replace(`/properties?${qs.toString()}`);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setToast(null);

    const qs = buildQueryFromState(currentState);

    void (async () => {
      try {
        const res = await apiGet<ListResponse>(`/properties?${qs.toString()}`);
        if (cancelled) return;
        setData(res);

        const items = res?.items ?? [];
        if (!items.length) {
          setToast("No properties found. Try changing filters or keywords.");
        }
      } catch (e) {
        if (cancelled) return;
        const message =
          e instanceof Error ? e.message : "Failed to load properties";
        setToast(message);
        setData({ items: [], total: 0, page: 1, limit: currentState.limit });
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentState]);

  return (
    <div className="min-h-screen bg-zinc-50">
      {toast ? (
        <SearchToast message={toast} onClose={() => setToast(null)} />
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pt-6">
        <PropertyFiltersBar
          metadata={metadata}
          value={currentState}
          loading={loading}
          onChange={(next) => replaceUrl(next)}
          onSubmit={() => replaceUrl({ ...currentState, page: 1 })}
          onClear={() =>
            replaceUrl({
              purpose: currentState.purpose,
              page: 1,
              limit: currentState.limit,
            })
          }
        />

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-zinc-600">
            {data?.total !== undefined ? (
              <span>{data.total.toLocaleString()} results</span>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
                >
                  <div className="h-44 w-full animate-pulse bg-zinc-100" />
                  <div className="space-y-3 p-4">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100" />
                  </div>
                </div>
              ))
            : (data?.items ?? []).map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
        </div>

        <Pagination
          page={currentState.page}
          limit={currentState.limit}
          total={data?.total ?? 0}
          onPageChange={(p) => replaceUrl({ ...currentState, page: p })}
        />

        <div className="h-10" />
      </section>
    </div>
  );
}
