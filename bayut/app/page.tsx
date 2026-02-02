import { Suspense } from "react";
import { Header } from "../src/components/Header";
import { HomePage } from "../src/components/HomePage";
import type { PropertiesMetadata, Property } from "../src/types/property";
import { apiGetSafe } from "../src/lib/api";

const emptyMetadata: PropertiesMetadata = {
  purposes: ["rent", "sale"],
  categories: [],
  amenities: [],
  cities: [],
  communities: [],
};

export default async function Home() {
  const [metadataRes, featuredRes] = await Promise.all([
    apiGetSafe<PropertiesMetadata>("/properties/metadata", {
      cache: "no-store",
    }),
    apiGetSafe<Property[]>("/properties/featured?purpose=sale&limit=9", {
      cache: "no-store",
    }),
  ]);

  const metadata = metadataRes ?? emptyMetadata;
  const featured = featuredRes ?? [];

  return (
    <div>
      <Header />
      <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10" />}>
        <HomePage initialMetadata={metadata} initialFeatured={featured} />
      </Suspense>
    </div>
  );
}
