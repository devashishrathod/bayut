"use client";

import { useMemo, useState } from "react";
import type { PropertiesMetadata, PropertyPurpose } from "../types/property";

type Filters = {
  purpose: PropertyPurpose;
  q?: string;
  city?: string;
  community?: string;
  bedrooms?: number;
  maxPrice?: number;
};

export function HomeSearch({
  metadata,
  onSearch,
}: {
  metadata: PropertiesMetadata;
  onSearch: (filters: Filters) => void;
}) {
  const [purpose, setPurpose] = useState<PropertyPurpose>("sale");
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [community, setCommunity] = useState("");
  const [bedrooms, setBedrooms] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const communityOptions = useMemo(() => {
    if (!city) return metadata.communities;
    return metadata.communities;
  }, [city, metadata.communities]);

  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-4xl rounded-2xl bg-white/95 p-3 shadow-xl ring-1 ring-black/5 backdrop-blur">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPurpose("sale")}
            className={
              purpose === "sale"
                ? "rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white"
                : "rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-200"
            }
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setPurpose("rent")}
            className={
              purpose === "rent"
                ? "rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white"
                : "rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-200"
            }
          >
            Rent
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-7">
            <label className="block text-xs font-semibold text-zinc-700">
              Enter location
            </label>
            <input
              value={community || city}
              onChange={(e) => {
                setCommunity(e.target.value);
                if (!e.target.value) {
                  setCity("");
                }
              }}
              placeholder="City, community or building"
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none ring-emerald-200 focus:ring-4"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {metadata.cities.slice(0, 6).map((c) => (
                <button
                  key={c.name}
                  type="button"
                  className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-200"
                  onClick={() => {
                    setCity(c.name);
                    setCommunity("");
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-zinc-700">
              Keywords
            </label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g. marina, villa, furnished"
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none ring-emerald-200 focus:ring-4"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() =>
                onSearch({
                  purpose,
                  q: q.trim() || undefined,
                  city: city || undefined,
                  community: community || undefined,
                  bedrooms: bedrooms === "" ? undefined : bedrooms,
                  maxPrice: maxPrice === "" ? undefined : maxPrice,
                })
              }
              className="mt-5 h-10 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Search
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-8">
            <label className="block text-xs font-semibold text-zinc-700">
              Community
            </label>
            <select
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none ring-emerald-200 focus:ring-4"
            >
              <option value="">Any</option>
              {communityOptions.slice(0, 30).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-zinc-700">
              Beds
            </label>
            <select
              value={bedrooms}
              onChange={(e) =>
                setBedrooms(e.target.value ? Number(e.target.value) : "")
              }
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none ring-emerald-200 focus:ring-4"
            >
              <option value="">Any</option>
              {[1, 2, 3, 4, 5].map((b) => (
                <option key={b} value={b}>
                  {b}+
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-zinc-700">
              Max price (AED)
            </label>
            <select
              value={maxPrice}
              onChange={(e) =>
                setMaxPrice(e.target.value ? Number(e.target.value) : "")
              }
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none ring-emerald-200 focus:ring-4"
            >
              <option value="">Any</option>
              {[50000, 100000, 250000, 500000, 1000000, 2000000].map((p) => (
                <option key={p} value={p}>
                  {p.toLocaleString()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}
