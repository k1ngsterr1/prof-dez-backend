import { IsString } from 'class-validator';

export class FormDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  subject: string;

  @IsString()
  message: string;
}
export class ContactFormDto {
  @IsString()
  name: string;

  @IsString()
  company: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  subject: string;

  @IsString()
  message: string;
}
