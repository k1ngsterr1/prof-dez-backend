// dto/create-product.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsISO8601,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { ItemDto } from './item.dto';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return typeof value === 'string' ? value.split(',') : [];
    }
  })
  @IsArray()
  @ArrayNotEmpty()
  categoryIds: string[];

  @IsOptional()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return typeof value === 'string' ? value.split(',') : [];
    }
  })
  @IsArray()
  @ArrayNotEmpty()
  subcategoryIds: string[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  images: string[];

  @IsOptional()
  @Transform(({ value }) => {
    return value === 'true';
  })
  @IsBoolean()
  isInStock: boolean;

  @IsOptional()
  @IsString()
  expiry: string;

  @IsOptional()
  @Transform(({ value }) => {
    return value === 'true';
  })
  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? plainToInstance(ItemDto, parsed) : [];
      } catch {
        return [];
      }
    }
    return value;
  })
  @ValidateNested({ each: true })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => ItemDto)
  items: ItemDto[];
}
