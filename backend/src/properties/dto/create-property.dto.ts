import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import {
  CompletionStatus,
  OwnershipType,
  PropertyPurpose,
  RentFrequency,
  Urgency,
} from '@prisma/client';

export class CreatePropertyDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsEnum(PropertyPurpose)
  purpose!: PropertyPurpose;

  @IsString()
  categoryId!: string;

  @IsOptional()
  @IsString()
  subCategoryId?: string;

  @IsOptional()
  @IsString()
  referenceNo?: string;

  @IsOptional()
  @IsEnum(CompletionStatus)
  completion?: CompletionStatus;

  @IsOptional()
  @IsString()
  handoverDate?: string;

  @IsInt()
  @Min(0)
  price!: number;

  @IsInt()
  @Min(0)
  bedrooms!: number;

  @IsInt()
  @Min(0)
  bathrooms!: number;

  @IsInt()
  @Min(0)
  areaSqft!: number;

  @IsOptional()
  @IsEnum(RentFrequency)
  rentFrequency?: RentFrequency;

  @IsOptional()
  @IsBoolean()
  furnished?: boolean;

  @IsString()
  city!: string;

  @IsString()
  community!: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(Urgency)
  urgency?: Urgency;

  @IsOptional()
  @IsString()
  developerName?: string;

  @IsOptional()
  @IsEnum(OwnershipType)
  ownership?: OwnershipType;

  @IsOptional()
  @IsInt()
  @Min(0)
  balconySizeSqft?: number;

  @IsOptional()
  @IsBoolean()
  parkingAvailable?: boolean;

  @IsOptional()
  @IsString()
  buildingName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalFloors?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  swimmingPools?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalParkingSpaces?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalBuildingAreaSqft?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  elevators?: number;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsUrl()
  coverImageUrl!: string;

  @IsArray()
  @IsUrl({}, { each: true })
  imageUrls!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenityNames?: string[];
}
