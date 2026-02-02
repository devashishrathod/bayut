import { Suspense } from "react";
import { Header } from "../../src/components/Header";
import { PropertiesResultsClient } from "../../src/components/PropertiesResultsClient";
import type { PropertiesMetadata } from "../../src/types/property";
import { apiGetSafe } from "../../src/lib/api";

const emptyMetadata: PropertiesMetadata = {
  purposes: ["rent", "sale"],
  categories: [],
  amenities: [],
  cities: [],
  communities: [],
};

export default async function PropertiesPage() {
  const metadataRes = await apiGetSafe<PropertiesMetadata>(
    "/properties/metadata",
    {
      cache: "no-store",
    },
  );

  const metadata = metadataRes ?? emptyMetadata;

  return (
    <div>
      <Header />
      <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10" />}>
        <PropertiesResultsClient metadata={metadata} />
      </Suspense>
    </div>
  );
}
