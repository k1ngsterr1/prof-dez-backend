import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsArray,
  ArrayNotEmpty,
  IsPositive,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  volume: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  images: string[];

  @Type(() => Boolean)
  @IsBoolean()
  isInStock: boolean;

  @IsString()
  expiry: string;

  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  price?: number;
}
