import 'dotenv/config';
import {
  PrismaClient,
  CategoryType,
  CompletionStatus,
  OwnershipType,
  PropertyPurpose,
  RentFrequency,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : undefined,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

function pickOne<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T;
}

function pickMany<T>(items: T[], min: number, max: number): T[] {
  const count = Math.max(
    min,
    Math.min(max, Math.floor(Math.random() * (max - min + 1)) + min),
  );
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function main() {
  const amenityNames = [
    'Central A/C',
    'Balcony',
    'Covered Parking',
    'Built-in Wardrobes',
    'Security',
    'Shared Pool',
    'Shared Gym',
    'Pets Allowed',
    'Children Play Area',
    'Concierge',
  ];

  await prisma.amenity.createMany({
    data: amenityNames.map((name) => ({ name })),
    skipDuplicates: true,
  });

  const amenities = await prisma.amenity.findMany();

  const cities = ['Dubai', 'Abu Dhabi', 'Sharjah'];
  const communitiesByCity: Record<string, string[]> = {
    Dubai: [
      'Dubai Marina',
      'Downtown Dubai',
      'JVC',
      'Business Bay',
      'Palm Jumeirah',
    ],
    'Abu Dhabi': ['Al Reem Island', 'Khalifa City', 'Saadiyat Island'],
    Sharjah: ['Al Nahda', 'Al Majaz', 'Muwaileh'],
  };

  const coverImages = [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
  ];

  const residentialSubcats = [
    'Apartment',
    'Villa',
    'Townhouse',
    'Penthouse',
    'Villa Compound',
    'Hotel Apartment',
    'Land',
    'Building',
    'Other',
  ];

  const commercialSubcats = [
    'Office',
    'Shop',
    'Warehouse',
    'Labour Camp',
    'Bulk Unit',
    'Floor',
    'Factory',
    'Mixed Use Land',
    'Showroom',
    'Other',
  ];

  await prisma.category.upsert({
    where: { id: 'cat_residential' },
    update: {
      name: 'Residential',
      type: CategoryType.residential,
      sortOrder: 1,
    },
    create: {
      id: 'cat_residential',
      name: 'Residential',
      type: CategoryType.residential,
      sortOrder: 1,
    },
  });
  await prisma.category.upsert({
    where: { id: 'cat_commercial' },
    update: { name: 'Commercial', type: CategoryType.commercial, sortOrder: 2 },
    create: {
      id: 'cat_commercial',
      name: 'Commercial',
      type: CategoryType.commercial,
      sortOrder: 2,
    },
  });

  const residentialCategory = await prisma.category.findUnique({
    where: { id: 'cat_residential' },
  });
  const commercialCategory = await prisma.category.findUnique({
    where: { id: 'cat_commercial' },
  });
  if (!residentialCategory || !commercialCategory) {
    throw new Error('Failed to seed categories');
  }

  await prisma.subCategory.createMany({
    data: residentialSubcats.map((name, idx) => ({
      name,
      sortOrder: idx + 1,
      categoryId: residentialCategory.id,
    })),
    skipDuplicates: true,
  });

  await prisma.subCategory.createMany({
    data: commercialSubcats.map((name, idx) => ({
      name,
      sortOrder: idx + 1,
      categoryId: commercialCategory.id,
    })),
    skipDuplicates: true,
  });

  const residentialSubCategoryRows = await prisma.subCategory.findMany({
    where: { categoryId: residentialCategory.id },
    orderBy: { sortOrder: 'asc' },
  });
  const commercialSubCategoryRows = await prisma.subCategory.findMany({
    where: { categoryId: commercialCategory.id },
    orderBy: { sortOrder: 'asc' },
  });

  const purposes: PropertyPurpose[] = [
    PropertyPurpose.rent,
    PropertyPurpose.sale,
  ];

  const rentFrequencies: RentFrequency[] = [
    RentFrequency.yearly,
    RentFrequency.monthly,
    RentFrequency.weekly,
    RentFrequency.daily,
  ];

  const targetPropertiesCount = 150;
  const existingCount = await prisma.property.count();
  const propertiesCount = Math.max(0, targetPropertiesCount - existingCount);

  for (let i = 0; i < propertiesCount; i += 1) {
    const city = pickOne(cities);
    const community = pickOne(communitiesByCity[city] ?? ['Central']);

    const purpose = pickOne(purposes);
    const isCommercial = Math.random() > 0.7;
    const category = isCommercial ? commercialCategory : residentialCategory;
    const subCategory = isCommercial
      ? pickOne(commercialSubCategoryRows)
      : pickOne(residentialSubCategoryRows);

    const bedrooms = isCommercial
      ? 0
      : Math.random() > 0.18
        ? Math.floor(Math.random() * 5) + 1
        : 0;
    const bathrooms = isCommercial
      ? 0
      : Math.max(1, Math.floor(Math.random() * Math.max(1, bedrooms)) + 1);
    const areaSqft = isCommercial
      ? 800 + Math.floor(Math.random() * 4200)
      : 420 + Math.max(0, bedrooms) * 360 + Math.floor(Math.random() * 420);

    const rentFrequency =
      purpose === PropertyPurpose.rent ? pickOne(rentFrequencies) : null;

    const price = (() => {
      if (purpose === PropertyPurpose.sale) {
        const base = isCommercial ? 950_000 : 650_000;
        const bedroomsFactor = isCommercial ? 0 : bedrooms * 320_000;
        const areaFactor = Math.floor(areaSqft * (180 + Math.random() * 80));
        const noise = Math.floor(Math.random() * 900_000);
        return Math.max(250_000, base + bedroomsFactor + areaFactor + noise);
      }

      const yearly =
        (isCommercial ? 120_000 : 55_000) +
        (isCommercial ? 0 : bedrooms * 40_000) +
        Math.floor(Math.random() * 140_000);

      if (rentFrequency === RentFrequency.monthly) {
        return Math.max(2500, Math.floor(yearly / 12));
      }
      if (rentFrequency === RentFrequency.weekly) {
        return Math.max(600, Math.floor(yearly / 52));
      }
      if (rentFrequency === RentFrequency.daily) {
        return Math.max(120, Math.floor(yearly / 365));
      }
      return yearly;
    })();

    const furnished = Math.random() > 0.6;

    const completion =
      Math.random() > 0.55 ? CompletionStatus.ready : CompletionStatus.off_plan;
    const handoverDate =
      completion === CompletionStatus.off_plan
        ? pickOne(['Q2 2026', 'Q4 2026', 'Q2 2027', 'Q4 2027', 'Q1 2028'])
        : null;

    const referenceNo = `BAYUT-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Math.floor(
      100000 + Math.random() * 900000,
    )}`;

    const developerName = pickOne([
      'Emaar Properties',
      'Damac Properties',
      'Nakheel',
      'Sobha Realty',
      'Meraas',
      'Azizi Developments',
      'Dubai Properties',
      'Unique Saray Properties',
    ]);

    const ownership =
      Math.random() > 0.25 ? OwnershipType.freehold : OwnershipType.leasehold;
    const balconySizeSqft = isCommercial
      ? null
      : 40 + Math.floor(Math.random() * 180);
    const parkingAvailable = Math.random() > 0.2;

    const buildingName = isCommercial
      ? pickOne([
          'Business Tower',
          'City Centre Offices',
          'Marina Plaza',
          'Downtown Offices',
        ])
      : pickOne([
          'Saray Prime Residence',
          'Marina Heights',
          'Downtown Views',
          'Palm Residences',
        ]);
    const totalFloors = 10 + Math.floor(Math.random() * 40);
    const swimmingPools = isCommercial ? 0 : Math.floor(Math.random() * 3);
    const totalParkingSpaces = 40 + Math.floor(Math.random() * 160);
    const totalBuildingAreaSqft = 50_000 + Math.floor(Math.random() * 250_000);
    const elevators = 1 + Math.floor(Math.random() * 6);

    const title =
      purpose === PropertyPurpose.sale
        ? `${isCommercial ? '' : `${bedrooms} BR `}${subCategory.name} for Sale in ${community}`
        : `${isCommercial ? '' : `${bedrooms} BR `}${subCategory.name} for Rent in ${community}`;

    const description =
      'Modern layout, bright interiors, and excellent community amenities. Close to transport, schools, and shopping.';

    const location = `Near ${pickOne([
      'metro station',
      'mall',
      'parks',
      'business district',
      'schools',
      'beach access',
    ])}`;
    const notes = pickOne([
      'Ready to move in.',
      'High floor with open views.',
      'Corner unit with great natural light.',
      'Spacious layout ideal for families.',
      'Excellent rental yield potential.',
    ]);
    const urgency = pickOne([
      'this_month',
      'within_2_months',
      'flexible',
    ] as const);

    const coverImageUrl = pickOne(coverImages);
    const imageUrls = pickMany(coverImages, 2, 4);

    const connectAmenities = pickMany(amenities, 3, 6).map((a) => ({
      id: a.id,
    }));

    await prisma.property.create({
      data: {
        title,
        description,
        purpose,
        categoryId: category.id,
        subCategoryId: subCategory.id,
        referenceNo,
        completion,
        handoverDate: handoverDate ?? undefined,
        truCheckOn: new Date(),
        price,
        bedrooms,
        bathrooms,
        areaSqft,
        rentFrequency: rentFrequency ?? undefined,
        furnished,
        city,
        community,
        location,
        notes,
        urgency,
        developerName,
        ownership,
        balconySizeSqft: balconySizeSqft ?? undefined,
        parkingAvailable,
        buildingName,
        totalFloors,
        swimmingPools,
        totalParkingSpaces,
        totalBuildingAreaSqft,
        elevators,
        contactName: pickOne([
          'Devashish',
          'Aman',
          'Sara',
          'Hassan',
          'Fatima',
          'Rahul',
        ]),
        contactEmail: pickOne([
          'agent1@bayut-clone.dev',
          'agent2@bayut-clone.dev',
          'agent3@bayut-clone.dev',
        ]),
        contactPhone: pickOne([
          '+971500000001',
          '+971500000002',
          '+971500000003',
        ]),
        coverImageUrl,
        imageUrls,
        amenities: {
          connect: connectAmenities,
        },
      },
    });
  }
}

main()
  .catch(async (e) => {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
