"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  PropertiesMetadata,
  Property,
  PropertyPurpose,
  RentFrequency,
} from "../types/property";
import { apiGetSafe, apiPost, getAuthToken } from "../lib/api";

type MeResponse = {
  user: {
    userId: string;
    email: string;
    name?: string | null;
    phone?: string | null;
  };
};

type FormState = {
  purpose: PropertyPurpose;
  categoryType: "residential" | "commercial";
  categoryId: string;
  subCategoryId: string;
  title: string;
  description: string;
  price: string;
  areaSqft: string;
  bedrooms: string;
  bathrooms: string;
  rentFrequency?: RentFrequency;
  furnished: boolean;
  city: string;
  community: string;
  location: string;
  notes: string;
  coverImageUrl: string;
  imageUrlsCsv: string;
};

function defaultForm(): FormState {
  return {
    purpose: "sale",
    categoryType: "residential",
    categoryId: "",
    subCategoryId: "",
    title: "",
    description: "",
    price: "",
    areaSqft: "",
    bedrooms: "",
    bathrooms: "",
    rentFrequency: "yearly",
    furnished: false,
    city: "Dubai",
    community: "",
    location: "",
    notes: "",
    coverImageUrl:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    imageUrlsCsv: "",
  };
}

export function AddPropertyModalHost() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isOpen = searchParams.get("addProperty") === "1";

  const [metadata, setMetadata] = useState<PropertiesMetadata | null>(null);
  const [me, setMe] = useState<MeResponse["user"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => defaultForm());

  const token = useMemo(() => (isOpen ? getAuthToken() : null), [isOpen]);

  const categoriesForType = useMemo(() => {
    const list = metadata?.categories ?? [];
    return list.filter((c) => c.type === form.categoryType);
  }, [metadata?.categories, form.categoryType]);

  const subCategoriesForSelected = useMemo(() => {
    const cat = categoriesForType.find((c) => c.id === form.categoryId);
    return cat?.subCategories ?? [];
  }, [categoriesForType, form.categoryId]);

  function close() {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("addProperty");
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
    setError(null);
    setSuccess(null);
  }

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setSuccess(null);

    setLoading(true);
    void (async () => {
      const [meta, meRes] = await Promise.all([
        apiGetSafe<PropertiesMetadata>("/properties/metadata", {
          cache: "no-store",
        }),
        token
          ? apiGetSafe<MeResponse>("/auth/me", {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve(null),
      ]);

      setMetadata(meta);
      setMe(meRes?.user ?? null);
      setLoading(false);

      if (meta?.categories?.length) {
        const initialCat =
          meta.categories.find((c) => c.type === form.categoryType)?.id ??
          meta.categories[0]?.id ??
          "";
        setForm((prev) => ({
          ...prev,
          categoryId: prev.categoryId || initialCat,
        }));
      }
    })();
  }, [isOpen, token, form.categoryType]);

  useEffect(() => {
    if (!isOpen) return;
    if (!form.categoryId) return;

    const validSub = subCategoriesForSelected.some(
      (s) => s.id === form.subCategoryId,
    );
    if (!validSub) {
      const first = subCategoriesForSelected[0]?.id ?? "";
      setForm((prev) => ({ ...prev, subCategoryId: first }));
    }
  }, [isOpen, form.categoryId, subCategoriesForSelected, form.subCategoryId]);

  function requireAuth() {
    const qs = searchParams.toString();
    const nextUrl = qs ? `${pathname}?${qs}` : pathname;
    router.push(`/login?next=${encodeURIComponent(nextUrl)}`);
  }

  async function submit() {
    setError(null);
    setSuccess(null);

    const auth = getAuthToken();
    if (!auth) {
      setError("Please log in to submit your property.");
      return;
    }

    if (!form.categoryId || !form.subCategoryId) {
      setError("Please select category and subcategory.");
      return;
    }

    const price = Number(form.price);
    const areaSqft = Number(form.areaSqft);
    const bedrooms = Number(form.bedrooms || "0");
    const bathrooms = Number(form.bathrooms || "0");

    if (!Number.isFinite(price) || price <= 0) {
      setError("Please enter a valid price.");
      return;
    }
    if (!Number.isFinite(areaSqft) || areaSqft <= 0) {
      setError("Please enter a valid area.");
      return;
    }

    const isCommercial = form.categoryType === "commercial";
    if (isCommercial && (bedrooms !== 0 || bathrooms !== 0)) {
      setError("For commercial properties, beds and baths must be 0.");
      return;
    }
    if (!isCommercial && (bedrooms <= 0 || bathrooms <= 0)) {
      setError("Please enter beds and baths.");
      return;
    }

    const imageUrls = form.imageUrlsCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const body = {
      title: form.title.trim() || "Untitled Property",
      description: form.description.trim() || "—",
      purpose: form.purpose,
      categoryId: form.categoryId,
      subCategoryId: form.subCategoryId,
      price,
      bedrooms: isCommercial ? 0 : bedrooms,
      bathrooms: isCommercial ? 0 : bathrooms,
      areaSqft,
      rentFrequency: form.purpose === "rent" ? form.rentFrequency : undefined,
      furnished: form.furnished,
      city: form.city,
      community: form.community.trim() || "Central",
      location: form.location.trim() || undefined,
      notes: form.notes.trim() || undefined,
      coverImageUrl: form.coverImageUrl,
      imageUrls,
      contactName: me?.name ?? undefined,
      contactEmail: me?.email ?? undefined,
      contactPhone: me?.phone ?? undefined,
    };

    setSubmitting(true);
    try {
      const created = await apiPost<Property, typeof body>(
        "/properties",
        body,
        {
          headers: {
            Authorization: `Bearer ${auth}`,
          },
        },
      );
      setSuccess("Property submitted successfully.");
      setSubmitting(false);
      close();
      router.push(`/properties/${created.id}`);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to submit property";
      setError(message);
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  const isAuthed = Boolean(token);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-t-2xl bg-white shadow-xl ring-1 ring-black/10 sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <div>
            <div className="text-sm font-semibold text-zinc-900">
              Add Property
            </div>
            <div className="mt-1 text-xs text-zinc-600">
              Submit your listing. We’ll email you a confirmation.
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="max-h-[85vh] overflow-y-auto px-5 py-4 sm:max-h-[75vh]">
          {loading ? (
            <div className="text-sm text-zinc-600">Loading…</div>
          ) : !isAuthed ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <div className="text-sm font-semibold text-zinc-900">
                You need to log in
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                Please log in to submit a property. Your contact details will be
                auto-filled.
              </div>
              <button
                type="button"
                onClick={requireAuth}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
              {success ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-zinc-700">
                    Purpose
                  </span>
                  <select
                    className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-base sm:text-sm"
                    value={form.purpose}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        purpose: e.target.value as PropertyPurpose,
                      }))
                    }
                  >
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-zinc-700">
                    Usage
                  </span>
                  <select
                    className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-base sm:text-sm"
                    value={form.categoryType}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        categoryType: e.target.value as
                          | "residential"
                          | "commercial",
                        categoryId: "",
                        subCategoryId: "",
                      }))
                    }
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-zinc-700">
                    Category
                  </span>
                  <select
                    className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-base sm:text-sm"
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        categoryId: e.target.value,
                        subCategoryId: "",
                      }))
                    }
                  >
                    {categoriesForType.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-zinc-700">
                    Subcategory
                  </span>
                  <select
                    className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-base sm:text-sm"
                    value={form.subCategoryId}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, subCategoryId: e.target.value }))
                    }
                  >
                    {subCategoriesForSelected.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-xs font-semibold text-zinc-700">
                  Title
                </span>
                <input
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-base sm:text-sm"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-semibold text-zinc-700">
                  Description
                </span>
                <textarea
                  className="min-h-[90px] rounded-xl border border-zinc-200 bg-white px-3 py-2 text-base sm:text-sm"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-zinc-700">
                    {form.purpose === "rent"
                      ? "Expected rent"
                      : "Expected price"}
                  </span>
                  <input
                    inputMode="numeric"
                    className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-base sm:text-sm"
                    value={form.price}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, price: e.target.value }))
                    }
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-zinc-700">
                    Area (sqft)
                  </span>
                  <input
                    inputMode="numeric"
                    className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-base sm:text-sm"
                    value={form.areaSqft}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, areaSqft: e.target.value }))
                    }
                  />
                </label>

                {form.categoryType === "residential" ? (
                  <>
                    <label className="grid gap-1">
                      <span className="text-xs font-semibold text-zinc-700">
                        Beds
                      </span>
                      <input
                        inputMode="numeric"
                        className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-base sm:text-sm"
                        value={form.bedrooms}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, bedrooms: e.target.value }))
                        }
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-xs font-semibold text-zinc-700">
                        Baths
                      </span>
                      <input
                        inputMode="numeric"
                        className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-base sm:text-sm"
                        value={form.bathrooms}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, bathrooms: e.target.value }))
                        }
                      />
                    </label>
                  </>
                ) : null}

                {form.purpose === "rent" ? (
                  <label className="grid gap-1">
                    <span className="text-xs font-semibold text-zinc-700">
                      Rent frequency
                    </span>
                    <select
                      className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-base sm:text-sm"
                      value={form.rentFrequency}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          rentFrequency: e.target.value as RentFrequency,
                        }))
                      }
                    >
                      <option value="yearly">Yearly</option>
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                      <option value="daily">Daily</option>
                    </select>
                  </label>
                ) : null}

                <label className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    checked={form.furnished}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, furnished: e.target.checked }))
                    }
                  />
                  <span className="text-sm text-zinc-700">Furnished</span>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-zinc-700">
                    City
                  </span>
                  <input
                    className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-base sm:text-sm"
                    value={form.city}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, city: e.target.value }))
                    }
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-zinc-700">
                    Community
                  </span>
                  <input
                    className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-base sm:text-sm"
                    value={form.community}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, community: e.target.value }))
                    }
                  />
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-xs font-semibold text-zinc-700">
                  Cover image URL
                </span>
                <input
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-base sm:text-sm"
                  value={form.coverImageUrl}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, coverImageUrl: e.target.value }))
                  }
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-semibold text-zinc-700">
                  Extra image URLs (comma separated)
                </span>
                <input
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-base sm:text-sm"
                  value={form.imageUrlsCsv}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, imageUrlsCsv: e.target.value }))
                  }
                />
              </label>

              <div className="mt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void submit()}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : "Submit"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
