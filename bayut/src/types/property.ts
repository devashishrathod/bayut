export type PropertyPurpose = "rent" | "sale";
export type CategoryType = "residential" | "commercial";

export type RentFrequency = "yearly" | "monthly" | "weekly" | "daily";

export type Urgency = "this_month" | "within_2_months" | "flexible";

export type CompletionStatus = "ready" | "off_plan";

export type OwnershipType = "freehold" | "leasehold";

export type Amenity = {
  id: string;
  name: string;
};

export type SubCategory = {
  id: string;
  name: string;
};

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  subCategories: SubCategory[];
};

export type Property = {
  id: string;
  title: string;
  description: string;
  purpose: PropertyPurpose;
  category: { id: string; name: string; type: CategoryType };
  subCategory?: { id: string; name: string } | null;
  ownerId?: string | null;
  referenceNo?: string | null;
  completion?: CompletionStatus | null;
  truCheckOn?: string | null;
  handoverDate?: string | null;
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  rentFrequency?: RentFrequency | null;
  furnished: boolean;
  city: string;
  community: string;
  location?: string | null;
  notes?: string | null;
  urgency?: Urgency | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  developerName?: string | null;
  ownership?: OwnershipType | null;
  balconySizeSqft?: number | null;
  parkingAvailable?: boolean | null;
  buildingName?: string | null;
  totalFloors?: number | null;
  swimmingPools?: number | null;
  totalParkingSpaces?: number | null;
  totalBuildingAreaSqft?: number | null;
  elevators?: number | null;
  coverImageUrl: string;
  imageUrls: string[];
  amenities: Amenity[];
  createdAt: string;
  updatedAt: string;
};

export type PropertiesMetadata = {
  purposes: PropertyPurpose[];
  categories: Category[];
  amenities: Amenity[];
  cities: { name: string; count: number }[];
  communities: { name: string; count: number }[];
};
