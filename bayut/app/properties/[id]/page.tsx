import Link from "next/link";
import { Header } from "../../../src/components/Header";
import type { Property } from "../../../src/types/property";
import { apiGetSafe } from "../../../src/lib/api";
import { buildWhatsAppInquiryUrl } from "../../../src/lib/whatsapp";
import { LightboxGallery } from "../../../src/components/LightboxGallery";
import { PropertyCarousel } from "../../../src/components/PropertyCarousel";

function formatPurpose(purpose: Property["purpose"]) {
  return purpose === "rent" ? "For rent" : "For sale";
}

function formatCompletion(value?: Property["completion"]) {
  if (!value) return "—";
  return value === "off_plan" ? "Off-Plan" : "Ready";
}

function formatOwnership(value?: Property["ownership"]) {
  if (!value) return "—";
  return value === "freehold" ? "Freehold" : "Leasehold";
}

function formatUrgency(urgency?: Property["urgency"]) {
  if (!urgency) return "—";
  if (urgency === "this_month") return "This month";
  if (urgency === "within_2_months") return "Within 2 months";
  return "Flexible";
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function KeyValueGrid({
  items,
}: {
  items: Array<{ label: string; value: React.ReactNode }>;
}) {
  return (
    <div className="grid grid-cols-1 rounded-xl border border-zinc-200 bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex items-start justify-between gap-6 border-b border-zinc-100 px-5 py-4 last:border-b-0"
          >
            <div className="text-sm text-zinc-600">{it.label}</div>
            <div className="text-sm font-semibold text-zinc-900">
              {it.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const property = await apiGetSafe<Property>(`/properties/${id}`, {
    next: { revalidate: 60 },
  });

  const similar = await apiGetSafe<Property[]>(
    `/properties/${id}/similar?limit=6`,
    {
      next: { revalidate: 60 },
    },
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      {!property ? (
        <main className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
            <div className="text-sm font-semibold text-zinc-900">
              Property not found
            </div>
            <div className="mt-2 text-sm text-zinc-600">
              This listing may have been removed or the link is incorrect.
            </div>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Back to home
              </Link>
            </div>
          </div>
        </main>
      ) : (
        (() => {
          const appUrl =
            process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
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
          const locationLine = `${property.community}, ${property.city}`;
          const typeLabel =
            property.subCategory?.name ?? property.category.name;
          const shortHighlights = [
            property.furnished ? "Furnished" : null,
            property.amenities?.[0]?.name ?? null,
            property.amenities?.[1]?.name ?? null,
          ].filter(Boolean) as string[];

          return (
            <main className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
              <div className="text-sm text-zinc-600">
                <Link href="/" className="hover:text-zinc-900">
                  Home
                </Link>
                <span className="mx-2">/</span>
                <span className="text-zinc-900">{property.title}</span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-12">
                <section className="lg:col-span-7">
                  <div className="relative">
                    <LightboxGallery
                      title={property.title}
                      images={[
                        property.coverImageUrl,
                        ...(property.imageUrls ?? []),
                      ]}
                    />
                    <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      {formatPurpose(property.purpose)}
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-3xl font-semibold tracking-tight text-zinc-900">
                          {priceLabel}
                        </div>
                        <p className="mt-2 text-base text-zinc-600">
                          {locationLine}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-3 text-zinc-800">
                          <div className="inline-flex items-center gap-2 rounded-full bg-zinc-50 px-3 py-2 ring-1 ring-zinc-200">
                            <span className="text-sm font-semibold">Beds:</span>
                            <span className="text-sm font-semibold">
                              {property.bedrooms === 0
                                ? "Studio"
                                : property.bedrooms}
                            </span>
                          </div>
                          <div className="inline-flex items-center gap-2 rounded-full bg-zinc-50 px-3 py-2 ring-1 ring-zinc-200">
                            <span className="text-sm font-semibold">
                              Baths:
                            </span>
                            <span className="text-sm font-semibold">
                              {property.bathrooms}
                            </span>
                          </div>
                          <div className="inline-flex items-center gap-2 rounded-full bg-zinc-50 px-3 py-2 ring-1 ring-zinc-200">
                            <span className="text-sm font-semibold">Area:</span>
                            <span className="text-sm font-semibold">
                              {property.areaSqft.toLocaleString()} sqft
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                            {typeLabel}
                          </span>
                          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                            {formatPurpose(property.purpose)}
                          </span>
                          {property.furnished ? (
                            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                              Furnished
                            </span>
                          ) : null}
                        </div>

                        {shortHighlights.length ? (
                          <div className="mt-4 text-base font-semibold text-zinc-900">
                            {shortHighlights.join(" | ")}
                          </div>
                        ) : null}

                        <div className="mt-5 text-base font-semibold text-zinc-900">
                          {property.title}
                        </div>
                      </div>

                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                        <button
                          type="button"
                          className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-zinc-100 px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 sm:w-auto"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-zinc-100 px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 sm:w-auto"
                        >
                          Share
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-8">
                    <section>
                      <h2 className="text-xl font-semibold text-zinc-900">
                        Property Information
                      </h2>
                      <div className="mt-4">
                        <KeyValueGrid
                          items={[
                            { label: "Type", value: typeLabel },
                            {
                              label: "Purpose",
                              value: formatPurpose(property.purpose),
                            },
                            {
                              label: "Furnishing",
                              value: property.furnished
                                ? "Furnished"
                                : "Unfurnished",
                            },
                            {
                              label: "Reference no.",
                              value: property.referenceNo ?? property.id,
                            },
                            {
                              label: "Completion",
                              value: formatCompletion(property.completion),
                            },
                            {
                              label: "TruCheck™On",
                              value: property.truCheckOn
                                ? formatDate(property.truCheckOn)
                                : "—",
                            },
                            {
                              label: "Added on",
                              value: formatDate(property.createdAt),
                            },
                            {
                              label: "Handover date",
                              value:
                                property.completion === "off_plan"
                                  ? (property.handoverDate ?? "—")
                                  : "—",
                            },
                            {
                              label: "Rent frequency",
                              value:
                                property.purpose === "rent"
                                  ? (property.rentFrequency ?? "—")
                                  : "—",
                            },
                            {
                              label: "Location",
                              value: property.location ?? locationLine,
                            },
                            {
                              label: "Urgency",
                              value: formatUrgency(property.urgency),
                            },
                            { label: "Beds", value: property.bedrooms },
                            { label: "Baths", value: property.bathrooms },
                            {
                              label: "Area",
                              value: `${property.areaSqft.toLocaleString()} sqft`,
                            },
                            {
                              label: "Usage",
                              value:
                                property.category.type === "commercial"
                                  ? "Commercial"
                                  : "Residential",
                            },
                          ]}
                        />
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xl font-semibold text-zinc-900">
                        Validated Information
                      </h2>
                      <div className="mt-4">
                        <KeyValueGrid
                          items={[
                            {
                              label: "Developer",
                              value: property.developerName ?? "—",
                            },
                            {
                              label: "Ownership",
                              value: formatOwnership(property.ownership),
                            },
                            {
                              label: "Built-up Area",
                              value: `${property.areaSqft.toLocaleString()} sqft`,
                            },
                            {
                              label: "Balcony Size",
                              value:
                                property.balconySizeSqft !== null &&
                                property.balconySizeSqft !== undefined
                                  ? `${property.balconySizeSqft.toLocaleString()} sqft`
                                  : "—",
                            },
                            {
                              label: "Parking Availability",
                              value:
                                property.parkingAvailable === true
                                  ? "Yes"
                                  : property.parkingAvailable === false
                                    ? "No"
                                    : "—",
                            },
                          ]}
                        />
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xl font-semibold text-zinc-900">
                        Building Information
                      </h2>
                      <div className="mt-4">
                        <KeyValueGrid
                          items={[
                            {
                              label: "Building Name",
                              value: property.buildingName ?? "—",
                            },
                            {
                              label: "Total Floors",
                              value:
                                property.totalFloors !== null &&
                                property.totalFloors !== undefined
                                  ? property.totalFloors
                                  : "—",
                            },
                            {
                              label: "Swimming Pools",
                              value:
                                property.swimmingPools !== null &&
                                property.swimmingPools !== undefined
                                  ? property.swimmingPools
                                  : "—",
                            },
                            {
                              label: "Total Parking Spaces",
                              value:
                                property.totalParkingSpaces !== null &&
                                property.totalParkingSpaces !== undefined
                                  ? property.totalParkingSpaces
                                  : "—",
                            },
                            {
                              label: "Total Building Area",
                              value:
                                property.totalBuildingAreaSqft !== null &&
                                property.totalBuildingAreaSqft !== undefined
                                  ? `${property.totalBuildingAreaSqft.toLocaleString()} sqft`
                                  : "—",
                            },
                            {
                              label: "Elevators",
                              value:
                                property.elevators !== null &&
                                property.elevators !== undefined
                                  ? property.elevators
                                  : "—",
                            },
                          ]}
                        />
                      </div>
                    </section>

                    <div className="rounded-xl border border-zinc-200 bg-white p-6">
                      <h2 className="text-base font-semibold text-zinc-900">
                        Description
                      </h2>
                      <p className="mt-3 whitespace-pre-line text-base leading-7 text-zinc-700">
                        {property.description}
                      </p>
                      {property.notes ? (
                        <div className="mt-4 rounded-xl bg-zinc-50 p-4 text-base text-zinc-700">
                          {property.notes}
                        </div>
                      ) : null}
                    </div>

                    {property.amenities?.length ? (
                      <section>
                        <h2 className="text-xl font-semibold text-zinc-900">
                          Features / Amenities
                        </h2>
                        <div className="relative mt-4">
                          <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {property.amenities.slice(0, 10).map((a) => (
                              <div
                                key={a.id}
                                className="flex h-24 w-[180px] shrink-0 items-center justify-center rounded-xl bg-[#f7f2ea] px-4 text-center text-sm font-semibold text-zinc-900 ring-1 ring-[#eadfcd]"
                              >
                                {a.name}
                              </div>
                            ))}
                            {property.amenities.length > 10 ? (
                              <div className="flex h-24 w-[180px] shrink-0 items-center justify-center rounded-xl bg-[#f7f2ea] px-4 text-center text-sm font-semibold text-emerald-700 ring-1 ring-[#eadfcd]">
                                +{property.amenities.length - 10} more
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </section>
                    ) : null}
                  </div>
                </section>

                <aside className="lg:col-span-5">
                  <div className="lg:sticky lg:top-20">
                    <div className="rounded-xl border border-zinc-200 bg-white p-6">
                      <div className="text-sm font-semibold text-zinc-900">
                        Key information
                      </div>
                      <div className="mt-4 grid gap-3">
                        <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
                          <div className="text-sm text-zinc-600">Price</div>
                          <div className="text-sm font-semibold text-emerald-700">
                            {priceLabel}
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
                          <div className="text-sm text-zinc-600">Beds</div>
                          <div className="text-sm font-semibold text-zinc-900">
                            {property.bedrooms}
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
                          <div className="text-sm text-zinc-600">Baths</div>
                          <div className="text-sm font-semibold text-zinc-900">
                            {property.bathrooms}
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
                          <div className="text-sm text-zinc-600">Area</div>
                          <div className="text-sm font-semibold text-zinc-900">
                            {property.areaSqft.toLocaleString()} sqft
                          </div>
                        </div>
                        {property.contactName ||
                        property.contactEmail ||
                        property.contactPhone ? (
                          <div className="rounded-xl bg-zinc-50 px-4 py-3">
                            <div className="text-sm font-semibold text-zinc-900">
                              Contact
                            </div>
                            <div className="mt-2 text-sm text-zinc-700">
                              {property.contactName ? (
                                <div>{property.contactName}</div>
                              ) : null}
                              {property.contactEmail ? (
                                <div>{property.contactEmail}</div>
                              ) : null}
                              {property.contactPhone ? (
                                <div>{property.contactPhone}</div>
                              ) : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-6">
                      <div className="text-sm font-semibold text-zinc-900">
                        Call agent
                      </div>
                      <p className="mt-2 text-sm text-zinc-600">
                        Request more details about this listing.
                      </p>
                      <button
                        type="button"
                        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
                      >
                        Call agent
                      </button>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50"
                      >
                        WhatsApp
                      </a>
                      <button
                        type="button"
                        className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50"
                      >
                        Email
                      </button>
                    </div>
                  </div>
                </aside>
              </div>

              <section className="mt-12">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-zinc-900">
                      Recommended for you
                    </h2>
                    <p className="mt-1 text-sm text-zinc-600">
                      More listings in {property.community} and nearby areas
                    </p>
                  </div>
                  <Link
                    href="/properties"
                    className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    View more
                  </Link>
                </div>

                {(similar ?? []).length ? (
                  <PropertyCarousel
                    items={(similar ?? []).slice(0, 9)}
                    ariaLabel="Similar properties"
                  />
                ) : (
                  <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
                    No similar properties found.
                  </div>
                )}
              </section>
            </main>
          );
        })()
      )}
    </div>
  );
}
