import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsArray,
  ArrayNotEmpty,
  IsPositive,
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

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  images: string[];

  @IsBoolean()
  isInStock: boolean;

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  price: number;
}
