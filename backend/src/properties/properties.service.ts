import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '@prisma/client';
import { CreatePropertyDto } from './dto/create-property.dto';
import { ListPropertiesQuery } from './dto/list-properties.query';
import { ListFeaturedPropertiesQuery } from './dto/list-featured-properties.query';
import { MailerService } from '../auth/mailer.service';

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
  ) {}

  private propertySubmittedEmailHtml(args: {
    title: string;
    purposeLabel: string;
    priceLabel: string;
    typeLabel: string;
    locationLine: string;
    beds: number;
    baths: number;
    areaSqft: number;
    propertyUrl: string;
    referenceNo?: string | null;
  }) {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
  </head>
  <body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <div style="max-width:640px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border-radius:18px;padding:28px;border:1px solid #e5e7eb;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:34px;height:34px;border-radius:999px;background:#059669;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;">b</div>
          <div style="font-size:18px;font-weight:700;color:#059669;">bayut</div>
        </div>
        <h2 style="margin:18px 0 0 0;font-size:18px;">Property submitted successfully</h2>
        <p style="margin:10px 0 0 0;font-size:14px;line-height:20px;color:#374151;">
          We have received your property submission. Here is a summary:
        </p>

        <div style="margin:18px 0 0 0;background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:16px;">
          <div style="font-size:14px;font-weight:800;color:#111827;">${args.title}</div>
          <div style="margin-top:8px;font-size:12px;color:#374151;">${args.typeLabel} • ${args.purposeLabel}</div>
          <div style="margin-top:10px;font-size:18px;font-weight:800;color:#059669;">${args.priceLabel}</div>
          <div style="margin-top:10px;font-size:12px;color:#374151;">${args.locationLine}</div>
          <div style="margin-top:10px;font-size:12px;color:#374151;">
            Beds: <b>${args.beds}</b> &nbsp;|&nbsp; Baths: <b>${args.baths}</b> &nbsp;|&nbsp; Area: <b>${args.areaSqft.toLocaleString()} sqft</b>
          </div>
          <div style="margin-top:10px;font-size:12px;color:#6b7280;">Reference: <b style="color:#111827;">${args.referenceNo ?? '—'}</b></div>
        </div>

        <div style="margin:18px 0 0 0;">
          <a href="${args.propertyUrl}" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;border-radius:12px;padding:12px 16px;font-size:14px;font-weight:700;">View property</a>
        </div>

        <p style="margin:18px 0 0 0;font-size:12px;color:#6b7280;">Thanks,<br/>Bayut Team</p>
      </div>
      <div style="text-align:center;margin-top:14px;font-size:11px;color:#9ca3af;">
        Please do not reply to this email. Replies are routed to an unmonitored mailbox.
      </div>
    </div>
  </body>
</html>`;
  }

  async metadata() {
    const [amenities, categories, citiesWithCounts, communitiesWithCounts] =
      await Promise.all([
        this.prisma.amenity.findMany({ orderBy: { name: 'asc' } }),
        this.prisma.category.findMany({
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          include: {
            subCategories: {
              orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            },
          },
        }),
        this.prisma.property.groupBy({
          by: ['city'],
          _count: { city: true },
          orderBy: { _count: { city: 'desc' } },
        }),
        this.prisma.property.groupBy({
          by: ['community'],
          _count: { community: true },
          orderBy: { _count: { community: 'desc' } },
        }),
      ]);

    return {
      purposes: ['rent', 'sale'],
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        subCategories: c.subCategories.map((s) => ({
          id: s.id,
          name: s.name,
        })),
      })),
      amenities: amenities.map((a) => ({ id: a.id, name: a.name })),
      cities: citiesWithCounts.map((c) => ({
        name: c.city,
        count: c._count.city ?? 0,
      })),
      communities: communitiesWithCounts.map((c) => ({
        name: c.community,
        count: c._count.community ?? 0,
      })),
    };
  }

  async featured(query: ListFeaturedPropertiesQuery) {
    const limit = query.limit ?? 8;
    const where: Prisma.PropertyWhereInput = {
      purpose: query.purpose,
    };

    return this.prisma.property.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { amenities: true, category: true, subCategory: true },
    });
  }

  async list(query: ListPropertiesQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const subCategoryIdList = (query.subCategoryIds ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 25);

    const bedroomList = (query.bedrooms ?? '')
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n >= 0)
      .map((n) => Math.floor(n))
      .slice(0, 10);

    const bathroomList = (query.bathrooms ?? '')
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n >= 0)
      .map((n) => Math.floor(n))
      .slice(0, 10);

    let minPrice = query.minPrice;
    let maxPrice = query.maxPrice;
    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      Number.isFinite(minPrice) &&
      Number.isFinite(maxPrice) &&
      minPrice > maxPrice
    ) {
      const tmp = minPrice;
      minPrice = maxPrice;
      maxPrice = tmp;
    }

    const baseWhere: Prisma.PropertyWhereInput = {
      purpose: query.purpose,
      city: query.city,
      community: query.community,
      rentFrequency: query.rentFrequency,
      category: query.categoryType ? { type: query.categoryType } : undefined,
      subCategoryId: subCategoryIdList.length
        ? { in: subCategoryIdList }
        : undefined,
      price:
        query.exactPrice !== undefined
          ? {
              equals: query.exactPrice,
            }
          : minPrice !== undefined || maxPrice !== undefined
            ? {
                gte: minPrice,
                lte: maxPrice,
              }
            : undefined,
      areaSqft:
        query.minAreaSqft !== undefined || query.maxAreaSqft !== undefined
          ? {
              gte: query.minAreaSqft,
              lte: query.maxAreaSqft,
            }
          : undefined,
    };

    const bedsWhere: Prisma.PropertyWhereInput | undefined = bedroomList.length
      ? {
          OR: bedroomList.map((b) => ({ bedrooms: { gte: b } })),
        }
      : undefined;

    const bathsWhere: Prisma.PropertyWhereInput | undefined =
      bathroomList.length
        ? {
            OR: bathroomList.map((b) => ({ bathrooms: { gte: b } })),
          }
        : undefined;

    const keywords = (query.q ?? '')
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 8);

    const keywordWhere: Prisma.PropertyWhereInput | undefined = keywords.length
      ? {
          AND: keywords.map((token) => ({
            OR: [
              { title: { contains: token, mode: 'insensitive' } },
              { description: { contains: token, mode: 'insensitive' } },
              { city: { contains: token, mode: 'insensitive' } },
              { community: { contains: token, mode: 'insensitive' } },
            ],
          })),
        }
      : undefined;

    const and: Prisma.PropertyWhereInput[] = [baseWhere];
    if (keywordWhere) and.push(keywordWhere);
    if (bedsWhere) and.push(bedsWhere);
    if (bathsWhere) and.push(bathsWhere);

    const where: Prisma.PropertyWhereInput = { AND: and };

    const orderBy: Prisma.PropertyOrderByWithRelationInput =
      query.sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { amenities: true, category: true, subCategory: true },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      items,
      page,
      limit,
      total,
      hasMore: skip + items.length < total,
    };
  }

  async getById(id: string) {
    return this.prisma.property.findUnique({
      where: { id },
      include: { amenities: true, category: true, subCategory: true },
    });
  }

  async similar(id: string, limit?: number) {
    const base = await this.prisma.property.findUnique({
      where: { id },
      select: {
        id: true,
        purpose: true,
        categoryId: true,
        subCategoryId: true,
        city: true,
        community: true,
        price: true,
      },
    });

    if (!base) return [];

    const take =
      limit && Number.isFinite(limit) ? Math.max(1, Math.min(12, limit)) : 6;

    const priceBand = {
      gte: Math.max(0, Math.floor(base.price * 0.75)),
      lte: Math.ceil(base.price * 1.25),
    };

    return this.prisma.property.findMany({
      where: {
        id: { not: base.id },
        purpose: base.purpose,
        OR: [{ community: base.community }, { city: base.city }],
        categoryId: base.categoryId,
        subCategoryId: base.subCategoryId ?? undefined,
        price: priceBand,
      },
      take,
      orderBy: { createdAt: 'desc' },
      include: { amenities: true, category: true, subCategory: true },
    });
  }

  async create(userId: string, dto: CreatePropertyDto) {
    const amenityNames = dto.amenityNames ?? [];

    const [user, category] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.category.findUnique({ where: { id: dto.categoryId } }),
    ]);

    if (!user) {
      throw new BadRequestException('Invalid user');
    }
    if (!category) {
      throw new BadRequestException('Invalid category');
    }

    const subCategoryId = dto.subCategoryId?.trim();
    if (!subCategoryId) {
      throw new BadRequestException('Subcategory is required');
    }

    const subCategory = await this.prisma.subCategory.findUnique({
      where: { id: subCategoryId },
    });
    if (!subCategory || subCategory.categoryId !== category.id) {
      throw new BadRequestException(
        'Invalid subcategory for selected category',
      );
    }

    if (dto.purpose === 'sale' && dto.rentFrequency) {
      throw new BadRequestException('Rent frequency is only allowed for rent');
    }
    if (dto.purpose === 'rent' && !dto.rentFrequency) {
      throw new BadRequestException('Rent frequency is required for rent');
    }

    const isCommercial = category.type === 'commercial';

    if (isCommercial) {
      if (dto.bedrooms !== 0 || dto.bathrooms !== 0) {
        throw new BadRequestException(
          'Commercial properties must have bedrooms and bathrooms set to 0',
        );
      }
    } else {
      if (dto.bedrooms < 0 || dto.bathrooms < 0) {
        throw new BadRequestException('Invalid bedrooms/bathrooms');
      }
    }

    if (dto.areaSqft <= 0) {
      throw new BadRequestException('Area must be greater than 0');
    }
    if (dto.price <= 0) {
      throw new BadRequestException(
        'Expected price/rent must be greater than 0',
      );
    }

    const created = await this.prisma.property.create({
      data: {
        ownerId: userId,
        title: dto.title,
        description: dto.description,
        purpose: dto.purpose,
        categoryId: category.id,
        subCategoryId: subCategory.id,
        referenceNo: dto.referenceNo,
        completion: dto.completion,
        handoverDate: dto.handoverDate,
        price: dto.price,
        bedrooms: dto.bedrooms,
        bathrooms: dto.bathrooms,
        areaSqft: dto.areaSqft,
        rentFrequency: dto.purpose === 'rent' ? dto.rentFrequency : undefined,
        furnished: dto.furnished ?? false,
        city: dto.city,
        community: dto.community,
        location: dto.location,
        notes: dto.notes,
        urgency: dto.urgency,
        developerName: dto.developerName,
        ownership: dto.ownership,
        balconySizeSqft: dto.balconySizeSqft,
        parkingAvailable: dto.parkingAvailable,
        buildingName: dto.buildingName,
        totalFloors: dto.totalFloors,
        swimmingPools: dto.swimmingPools,
        totalParkingSpaces: dto.totalParkingSpaces,
        totalBuildingAreaSqft: dto.totalBuildingAreaSqft,
        elevators: dto.elevators,
        contactName: user.name ?? dto.contactName,
        contactEmail: user.email,
        contactPhone: user.phone ?? dto.contactPhone,
        coverImageUrl: dto.coverImageUrl,
        imageUrls: dto.imageUrls,
        amenities: {
          connectOrCreate: amenityNames.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: { amenities: true, category: true, subCategory: true },
    });

    const purposeLabel = created.purpose === 'rent' ? 'For rent' : 'For sale';
    const formattedPrice = `AED ${created.price.toLocaleString()}`;
    const priceLabel =
      created.purpose === 'rent' && created.rentFrequency
        ? `${formattedPrice} / ${created.rentFrequency}`
        : formattedPrice;
    const typeLabel = created.subCategory?.name ?? created.category.name;
    const locationLine = `${created.community}, ${created.city}`;

    const frontendOrigin =
      process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000';
    const propertyUrl = `${frontendOrigin}/properties/${created.id}`;

    try {
      await this.mailer.sendHtml(
        user.email,
        'Your property has been submitted',
        this.propertySubmittedEmailHtml({
          title: created.title,
          purposeLabel,
          priceLabel,
          typeLabel,
          locationLine,
          beds: created.bedrooms,
          baths: created.bathrooms,
          areaSqft: created.areaSqft,
          propertyUrl,
          referenceNo: created.referenceNo,
        }),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Property submission email failed: ${message}`);
    }

    return created;
  }
}
