import Image from "next/image";
import Link from "next/link";
import type { Property } from "../types/property";
import { buildWhatsAppInquiryUrl } from "../lib/whatsapp";

export function PropertyCard({ property }: { property: Property }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const propertyUrl = `${appUrl}/properties/${property.id}`;
  const whatsappUrl = buildWhatsAppInquiryUrl({
    phone: "918889524382",
    title: property.title,
    propertyUrl,
  });

  const isRent = property.purpose === "rent";
  const formattedPrice = `AED ${property.price.toLocaleString()}`;
  const priceLabel = isRent
    ? property.rentFrequency
      ? `${formattedPrice} / ${property.rentFrequency}`
      : formattedPrice
    : formattedPrice;
  const typeLabel = property.subCategory?.name ?? property.category.name;
  const locationLine = `${property.community}, ${property.city}`;

  return (
    <Link
      href={`/properties/${property.id}`}
      prefetch
      className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-52 w-full">
        <Image
          src={property.coverImageUrl}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          {isRent ? "For rent" : "For sale"}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-zinc-600">
              {typeLabel}
            </div>
            <div className="mt-1 text-base font-semibold text-emerald-700">
              {priceLabel}
            </div>
          </div>
          <div className="shrink-0 text-right text-[11px] text-zinc-600">
            {property.bedrooms} Beds
            <div>{property.bathrooms} Baths</div>
          </div>
        </div>

        <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-zinc-900">
          {property.title}
        </h3>

        <div className="mt-2 text-xs text-zinc-600">{locationLine}</div>
        <div className="mt-2 text-xs text-zinc-600">
          Area: {property.areaSqft.toLocaleString()} sqft
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {property.furnished ? (
            <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] text-zinc-700">
              Furnished
            </span>
          ) : null}
          {property.amenities.slice(0, 2).map((a) => (
            <span
              key={a.id}
              className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] text-zinc-700"
            >
              {a.name}
            </span>
          ))}
          {property.amenities.length > 2 ? (
            <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] text-zinc-700">
              +{property.amenities.length - 2} more
            </span>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            Email
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            Call
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(whatsappUrl, "_blank", "noopener,noreferrer");
            }}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-50 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100 hover:bg-emerald-100"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </Link>
  );
}
