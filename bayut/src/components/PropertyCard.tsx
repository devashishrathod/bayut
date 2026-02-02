"use client";

import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useMemo, useState } from "react";
import type { Property } from "../types/property";
import { buildWhatsAppInquiryUrl } from "../lib/whatsapp";

export function PropertyCard({
  property,
  variant = "grid",
}: {
  property: Property;
  variant?: "grid" | "list";
}) {
  const numberFormatter = useMemo(() => new Intl.NumberFormat("en-US"), []);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const propertyUrl = `${appUrl}/properties/${property.id}`;
  const contactPhone = property.contactPhone ?? "918889524382";
  const contactEmail = property.contactEmail ?? "example@email.com";

  const whatsappUrl = buildWhatsAppInquiryUrl({
    phone: contactPhone,
    title: property.title,
    propertyUrl,
  });

  const isRent = property.purpose === "rent";
  const formattedPrice = `AED ${numberFormatter.format(property.price)}`;
  const priceLabel = isRent
    ? property.rentFrequency
      ? `${formattedPrice} / ${property.rentFrequency}`
      : formattedPrice
    : formattedPrice;
  const typeLabel = property.subCategory?.name ?? property.category.name;
  const locationLine = `${property.community}, ${property.city}`;

  const bedsLabel =
    property.bedrooms === 0 ? "Studio" : String(property.bedrooms);
  const bathsLabel = String(property.bathrooms);

  const images = useMemo(() => {
    const raw = [property.coverImageUrl, ...(property.imageUrls ?? [])].filter(
      Boolean,
    );
    const unique = [...new Set(raw)];
    return unique.length ? unique : [property.coverImageUrl];
  }, [property.coverImageUrl, property.imageUrls]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  function goPrevImage() {
    setActiveImageIndex((i) => {
      const next = (i - 1 + images.length) % images.length;
      return next;
    });
  }

  function goNextImage() {
    setActiveImageIndex((i) => {
      const next = (i + 1) % images.length;
      return next;
    });
  }

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    if (!t) return;
    setTouchStartX(t.clientX);
    setTouchStartY(t.clientY);
  }

  function handleTouchMove(e: React.TouchEvent) {
    const t = e.touches[0];
    if (!t) return;
    if (touchStartX === null || touchStartY === null) return;
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if (Math.abs(dx) < 40) return;
    if (Math.abs(dx) < Math.abs(dy)) return;
    if (dx > 0) goPrevImage();
    else goNextImage();
    setTouchStartX(null);
    setTouchStartY(null);
  }

  const showCarouselControls = images.length > 1;

  return (
    <Link
      href={`/properties/${property.id}`}
      prefetch
      className={
        variant === "list"
          ? "group block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          : "group block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md"
      }
    >
      <div
        className={variant === "list" ? "flex flex-col sm:flex-row" : "block"}
      >
        <div
          className={
            variant === "list"
              ? "relative h-60 w-full shrink-0 sm:h-[220px] sm:w-[360px]"
              : "relative h-52 w-full"
          }
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <Image
            src={images[activeImageIndex] ?? property.coverImageUrl}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes={
              variant === "list"
                ? "(max-width: 640px) 100vw, 360px"
                : "(max-width: 768px) 100vw, 33vw"
            }
          />

          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
            {property.truCheckOn ? (
              <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-zinc-900 backdrop-blur">
                TruCheck™
              </span>
            ) : null}
            {property.completion ? (
              <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-zinc-900 backdrop-blur">
                {property.completion === "off_plan" ? "Off-Plan" : "Ready"}
              </span>
            ) : null}
          </div>

          <div className="pointer-events-none absolute left-3 bottom-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {isRent ? "For rent" : "For sale"}
          </div>

          {showCarouselControls ? (
            <>
              <button
                type="button"
                className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-zinc-900 shadow-sm ring-1 ring-zinc-200 backdrop-blur hover:bg-white group-hover:flex"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goPrevImage();
                }}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-zinc-900 shadow-sm ring-1 ring-zinc-200 backdrop-blur hover:bg-white group-hover:flex"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goNextImage();
                }}
                aria-label="Next image"
              >
                ›
              </button>

              <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
                {activeImageIndex + 1}/{images.length}
              </div>
            </>
          ) : null}
        </div>

        <div
          className={variant === "list" ? "min-w-0 flex-1 p-4 sm:p-5" : "p-4"}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-zinc-600">
                {typeLabel}
              </div>
              <div
                className={
                  variant === "list"
                    ? "mt-1 text-xl font-bold text-emerald-700"
                    : "mt-1 text-base font-semibold text-emerald-700"
                }
              >
                {priceLabel}
              </div>
            </div>

            <div
              className={
                variant === "list" ? "shrink-0" : "shrink-0 text-right"
              }
            >
              {variant === "list" ? (
                <div className="flex flex-wrap items-center justify-end gap-3 text-zinc-800">
                  <div className="inline-flex items-center gap-2 rounded-full bg-zinc-50 px-3 py-1.5 ring-1 ring-zinc-200">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M3 10h18" />
                      <path d="M7 10V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" />
                      <path d="M5 10v10" />
                      <path d="M19 10v10" />
                      <path d="M5 20h14" />
                    </svg>
                    <span className="text-sm font-semibold">{bedsLabel}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-zinc-50 px-3 py-1.5 ring-1 ring-zinc-200">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M6 12a6 6 0 0 1 12 0v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-8Z" />
                      <path d="M6 12h12" />
                    </svg>
                    <span className="text-sm font-semibold">{bathsLabel}</span>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-zinc-600">
                  {property.bedrooms} Beds
                  <div>{property.bathrooms} Baths</div>
                </div>
              )}
            </div>
          </div>

          <h3
            className={
              variant === "list"
                ? "mt-2 line-clamp-2 text-base font-semibold text-zinc-900"
                : "mt-2 line-clamp-2 text-sm font-semibold text-zinc-900"
            }
          >
            {property.title}
          </h3>

          <div className="mt-2 text-sm text-zinc-600">{locationLine}</div>
          <div className="mt-2 text-sm text-zinc-600">
            Area: {numberFormatter.format(property.areaSqft)} sqft
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {property.furnished ? (
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                Furnished
              </span>
            ) : null}
            {property.amenities.slice(0, 2).map((a) => (
              <span
                key={a.id}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700"
              >
                {a.name}
              </span>
            ))}
            {property.amenities.length > 2 ? (
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                +{property.amenities.length - 2} more
              </span>
            ) : null}
          </div>

          <div
            className={
              variant === "list"
                ? "mt-4 grid grid-cols-3 gap-2 sm:max-w-[360px]"
                : "mt-4 grid grid-cols-3 gap-2"
            }
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `mailto:${contactEmail}`;
              }}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              Email
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `tel:${contactPhone}`;
              }}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              Call
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(whatsappUrl, "_blank", "noopener,noreferrer");
              }}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-50 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100 hover:bg-emerald-100"
            >
              WhatsApp
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
