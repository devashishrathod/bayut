import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  IsIn,
} from 'class-validator';
import { CategoryType, PropertyPurpose, RentFrequency } from '@prisma/client';

export class ListPropertiesQuery {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(PropertyPurpose)
  purpose?: PropertyPurpose;

  @IsOptional()
  @IsEnum(CategoryType)
  categoryType?: CategoryType;

  @IsOptional()
  @IsString()
  subCategoryIds?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  community?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  exactPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  bedrooms?: string;

  @IsOptional()
  @IsString()
  bathrooms?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minAreaSqft?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxAreaSqft?: number;

  @IsOptional()
  @IsEnum(RentFrequency)
  rentFrequency?: RentFrequency;

  @IsOptional()
  @IsIn(['newest', 'oldest'])
  sort?: 'newest' | 'oldest';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
