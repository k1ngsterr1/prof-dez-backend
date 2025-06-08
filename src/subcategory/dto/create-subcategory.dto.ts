import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateSubcategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  categoryId: number;
}
