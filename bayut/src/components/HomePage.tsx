"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  PropertiesMetadata,
  Property,
  PropertyPurpose,
} from "../types/property";
import { apiGetSafe } from "../lib/api";
import { CarouselArrowButton } from "./CarouselArrowButton";
import { PropertyCard } from "./PropertyCard";
import {
  PropertyFiltersBar,
  type PropertyFiltersState,
} from "./PropertyFiltersBar";

type Filters = {
  purpose: PropertyPurpose;
  q?: string;
  city?: string;
  community?: string;
  bedrooms?: number;
  bathrooms?: number;
  categoryType?: "residential" | "commercial";
  subCategoryIds?: string;
  minPrice?: number;
  maxPrice?: number;
  minAreaSqft?: number;
  maxAreaSqft?: number;
  rentFrequency?: "yearly" | "monthly" | "weekly" | "daily";
  sort?: "newest" | "oldest";
};

export function HomePage({
  initialMetadata,
  initialFeatured,
}: {
  initialMetadata: PropertiesMetadata;
  initialFeatured: Property[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [metadata] = useState<PropertiesMetadata>(initialMetadata);
  const [featured, setFeatured] = useState<Property[]>(initialFeatured);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [featuredError, setFeaturedError] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const [filters, setFilters] = useState<PropertyFiltersState>({
    purpose: "sale",
    page: 1,
    limit: 20,
  });

  const dummyFeatured = useMemo<Property[]>(
    () => [
      {
        id: "dummy-1",
        title: "Luxury 2BR Apartment with Skyline Views",
        description: "Bright and modern apartment in a premium community.",
        purpose: "sale",
        category: {
          id: "cat_residential",
          name: "Residential",
          type: "residential",
        },
        subCategory: { id: "sub_apartment", name: "Apartment" },
        price: 1850000,
        bedrooms: 2,
        bathrooms: 2,
        areaSqft: 1320,
        rentFrequency: null,
        furnished: true,
        city: "Dubai",
        community: "Downtown Dubai",
        coverImageUrl:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
        imageUrls: [],
        amenities: [
          { id: "a1", name: "Pool" },
          { id: "a2", name: "Gym" },
          { id: "a3", name: "Parking" },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "dummy-2",
        title: "Modern 3BR Villa with Private Garden",
        description:
          "Spacious villa with premium finishes and great connectivity.",
        purpose: "sale",
        category: {
          id: "cat_residential",
          name: "Residential",
          type: "residential",
        },
        subCategory: { id: "sub_villa", name: "Villa" },
        price: 4250000,
        bedrooms: 3,
        bathrooms: 4,
        areaSqft: 2860,
        rentFrequency: null,
        furnished: false,
        city: "Dubai",
        community: "Dubai Hills Estate",
        coverImageUrl:
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=80",
        imageUrls: [],
        amenities: [
          { id: "a4", name: "Garden" },
          { id: "a5", name: "Security" },
          { id: "a6", name: "Community Park" },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "dummy-3",
        title: "Stylish 1BR Near Metro | High Floor",
        description: "A smart layout with excellent city connectivity.",
        purpose: "rent",
        category: {
          id: "cat_residential",
          name: "Residential",
          type: "residential",
        },
        subCategory: { id: "sub_apartment", name: "Apartment" },
        price: 98000,
        bedrooms: 1,
        bathrooms: 1,
        areaSqft: 780,
        rentFrequency: "yearly",
        furnished: true,
        city: "Dubai",
        community: "Dubai Marina",
        coverImageUrl:
          "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1400&q=80",
        imageUrls: [],
        amenities: [
          { id: "a7", name: "Metro Access" },
          { id: "a8", name: "Balcony" },
          { id: "a9", name: "Sea View" },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "dummy-4",
        title: "Premium 4BR Townhouse | Family Community",
        description: "Comfortable living with schools and parks nearby.",
        purpose: "rent",
        category: {
          id: "cat_residential",
          name: "Residential",
          type: "residential",
        },
        subCategory: { id: "sub_townhouse", name: "Townhouse" },
        price: 245000,
        bedrooms: 4,
        bathrooms: 4,
        areaSqft: 2510,
        rentFrequency: "yearly",
        furnished: false,
        city: "Dubai",
        community: "Arabian Ranches",
        coverImageUrl:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
        imageUrls: [],
        amenities: [
          { id: "a10", name: "Community Pool" },
          { id: "a11", name: "Kids Play Area" },
          { id: "a12", name: "Covered Parking" },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "dummy-5",
        title: "Penthouse with Panoramic Views | Private Terrace",
        description: "Exclusive penthouse with premium finishing and space.",
        purpose: "sale",
        category: {
          id: "cat_residential",
          name: "Residential",
          type: "residential",
        },
        subCategory: { id: "sub_penthouse", name: "Penthouse" },
        price: 12950000,
        bedrooms: 4,
        bathrooms: 5,
        areaSqft: 5120,
        rentFrequency: null,
        furnished: false,
        city: "Dubai",
        community: "Palm Jumeirah",
        coverImageUrl:
          "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1400&q=80",
        imageUrls: [],
        amenities: [
          { id: "a13", name: "Terrace" },
          { id: "a14", name: "Private Lift" },
          { id: "a15", name: "Concierge" },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "dummy-6",
        title: "Cozy Studio | Ready to Move | Great Value",
        description:
          "Well-maintained studio with a smart layout and amenities.",
        purpose: "rent",
        category: {
          id: "cat_residential",
          name: "Residential",
          type: "residential",
        },
        subCategory: { id: "sub_apartment", name: "Apartment" },
        price: 52000,
        bedrooms: 0,
        bathrooms: 1,
        areaSqft: 420,
        rentFrequency: "monthly",
        furnished: true,
        city: "Dubai",
        community: "Jumeirah Village Circle",
        coverImageUrl:
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
        imageUrls: [],
        amenities: [
          { id: "a16", name: "Gym" },
          { id: "a17", name: "Pool" },
          { id: "a18", name: "24/7 Security" },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],

    [],
  );

  function openAddProperty() {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("addProperty", "1");
    router.push(`/?${sp.toString()}`);
  }

  const title = useMemo(() => "Real homes live here", []);

  function handleSearchSubmit() {
    const params = new URLSearchParams();
    params.set("purpose", filters.purpose);
    if (filters.q) params.set("q", filters.q);
    if (filters.city) params.set("city", filters.city);
    if (filters.community) params.set("community", filters.community);
    if (filters.categoryType) params.set("categoryType", filters.categoryType);
    if (filters.subCategoryIds?.length)
      params.set("subCategoryIds", filters.subCategoryIds.join(","));
    if (filters.bedrooms?.length)
      params.set("bedrooms", filters.bedrooms.join(","));
    if (filters.bathrooms?.length)
      params.set("bathrooms", filters.bathrooms.join(","));
    if (filters.minAreaSqft !== undefined)
      params.set("minAreaSqft", String(filters.minAreaSqft));
    if (filters.maxAreaSqft !== undefined)
      params.set("maxAreaSqft", String(filters.maxAreaSqft));
    if (filters.minPrice !== undefined)
      params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice !== undefined)
      params.set("maxPrice", String(filters.maxPrice));
    if (filters.exactPrice !== undefined)
      params.set("exactPrice", String(filters.exactPrice));
    if (filters.rentFrequency)
      params.set("rentFrequency", filters.rentFrequency);
    if (filters.sort) params.set("sort", filters.sort);
    params.set("page", "1");
    params.set("limit", String(filters.limit ?? 20));

    router.push(`/properties?${params.toString()}`);
  }

  useEffect(() => {
    setFeaturedLoading(true);
    setFeaturedError(null);
    void (async () => {
      const items = await apiGetSafe<Property[]>(
        `/properties/featured?purpose=sale&limit=9`,
      );
      if (items === null) {
        setFeaturedError("Failed to load featured properties.");
        setFeaturedLoading(false);
        return;
      }
      if (items?.length) setFeatured(items);
      setFeaturedLoading(false);
    })();
  }, []);

  const featuredToRender = featured.length ? featured : dummyFeatured;

  const randomizedFeatured = useMemo(() => {
    const items = [...featuredToRender];
    const seedSource = items.map((p) => p.id).join("|");
    let seed = 0;
    for (let i = 0; i < seedSource.length; i += 1) {
      seed = (seed * 31 + seedSource.charCodeAt(i)) >>> 0;
    }

    function nextRand() {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    }

    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = Math.floor(nextRand() * (i + 1));
      const tmp = items[i];
      items[i] = items[j];
      items[j] = tmp;
    }

    return items;
  }, [featuredToRender]);

  function scrollCarousel(direction: "left" | "right") {
    const el = carouselRef.current;
    if (!el) return;
    const delta = Math.max(280, Math.floor(el.clientWidth * 0.85));
    el.scrollBy({
      left: direction === "left" ? -delta : delta,
      behavior: "smooth",
    });
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <section className="w-full">
        <div className="relative min-h-[520px] bg-zinc-900 sm:min-h-[560px]">
          <div className="absolute inset-0 overflow-hidden sm:rounded-none">
            <Image
              src="https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=2400&q=80"
              alt="Dubai skyline"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/55" />
          </div>

          <div className="relative mx-auto max-w-7xl px-[1px] pb-7 pt-6 sm:px-[1px] sm:pb-8 sm:pt-8">
            <div className="mx-auto max-w-3xl text-center text-white">
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                {title}
              </h1>
              <p className="mt-3 text-sm text-white/90 md:text-base">
                Real Data. Real Brokers. Real Properties.
              </p>
            </div>

            <div className="mt-8">
              <div className="mx-auto max-w-5xl">
                <PropertyFiltersBar
                  metadata={metadata}
                  value={filters}
                  loading={false}
                  onChange={(next) => setFilters(next)}
                  onSubmit={handleSearchSubmit}
                  onClear={() =>
                    setFilters({
                      purpose: filters.purpose,
                      page: 1,
                      limit: filters.limit,
                    })
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center">
              <div className="rounded-full bg-white/10 px-4 py-2 text-xs text-white/90 ring-1 ring-white/20">
                Want to find out more about UAE real estate using AI?
              </div>
            </div>

            <div className="mt-5 flex justify-center">
              <a
                href="https://www.youtube.com/watch?v=XzaewMJpDno"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur hover:bg-white/15"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M10 8l6 4-6 4V8z" fill="currentColor" />
                  </svg>
                </span>
                Experience the Journey
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-800 text-white shadow-sm ring-1 ring-emerald-950/10">
              <div className="absolute left-4 top-4">
                <div className="inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">
                  NEW
                </div>
              </div>

              <div className="grid grid-cols-1 items-center gap-4 px-5 py-5 sm:grid-cols-[160px_1fr_auto] sm:gap-6 sm:px-7 sm:py-6">
                <div className="relative hidden h-[84px] w-[160px] items-end sm:flex">
                  <svg
                    viewBox="0 0 220 120"
                    className="h-full w-full"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M10 110H210"
                      stroke="rgba(255,255,255,0.35)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M30 110V48c0-3 2-5 5-5h22c3 0 5 2 5 5v62"
                      fill="rgba(255,255,255,0.18)"
                    />
                    <path
                      d="M70 110V30c0-3 2-5 5-5h26c3 0 5 2 5 5v80"
                      fill="rgba(255,255,255,0.22)"
                    />
                    <path
                      d="M116 110V58c0-3 2-5 5-5h18c3 0 5 2 5 5v52"
                      fill="rgba(255,255,255,0.14)"
                    />
                    <path
                      d="M150 110V40c0-3 2-5 5-5h24c3 0 5 2 5 5v70"
                      fill="rgba(255,255,255,0.2)"
                    />
                    <path
                      d="M90 18c6 0 10 4 10 10"
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M103 24l14-10"
                      stroke="rgba(255,255,255,0.45)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M122 10h18v18h-18V10z"
                      fill="rgba(255,255,255,0.22)"
                    />
                  </svg>
                </div>

                <div className="min-w-0">
                  <div className="text-sm font-semibold sm:text-base">
                    Sell or Rent Your Property with Confidence
                  </div>
                  <div className="mt-1 text-xs text-white/90 sm:text-sm">
                    Connect with a trusted agent to secure the best deal,
                    faster.
                  </div>
                </div>

                <div className="flex items-center justify-start sm:justify-end">
                  <button
                    type="button"
                    onClick={openAddProperty}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-emerald-900 shadow-sm hover:bg-emerald-50"
                  >
                    Get Started
                    <span aria-hidden="true">›</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Featured properties
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Handpicked homes with great views and amenities
            </p>
          </div>
        </div>

        <div className="relative mt-5">
          <div
            ref={carouselRef}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {featuredLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[320px] shrink-0 snap-start overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
                  >
                    <div className="h-44 w-full animate-pulse bg-zinc-100" />
                    <div className="space-y-3 p-4">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
                      <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100" />
                    </div>
                  </div>
                ))
              : randomizedFeatured.map((p) => (
                  <div key={p.id} className="w-[320px] shrink-0 snap-start">
                    <PropertyCard property={p} />
                  </div>
                ))}
          </div>

          {featuredError ? (
            <div className="mt-3 text-sm text-zinc-600">{featuredError}</div>
          ) : null}

          <div className="pointer-events-none absolute inset-y-0 left-0 hidden items-center md:flex">
            <CarouselArrowButton
              direction="left"
              ariaLabel="Scroll left"
              onClick={() => scrollCarousel("left")}
              className="ml-2"
            />
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden items-center md:flex">
            <CarouselArrowButton
              direction="right"
              ariaLabel="Scroll right"
              onClick={() => scrollCarousel("right")}
              className="mr-2"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
