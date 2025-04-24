import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsString()
  @Length(0, 255)
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  city?: number;

  @IsNumber()
  @IsOptional()
  state?: number;

  @IsNumber()
  @IsOptional()
  country?: number;

  @IsString()
  @Length(0, 20)
  @IsOptional()
  zipCode?: string;

  @IsString()
  @Length(0, 15)
  @IsOptional()
  phone?: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(0, 255)
  @IsOptional()
  companyName?: string;

  @IsString()
  @Length(0, 100)
  @IsOptional()
  profession?: string;

  @IsString()
  @Length(0, 255)
  @IsOptional()
  referredBy?: string;

  @IsString()
  @IsOptional()
  @Length(8, 255) // Assuming minimum length of 8 for password
  password?: string;

  @IsBoolean()
  @IsOptional()
  downloadedInfoPac?: boolean;

  @IsOptional()
  AddedBy?: number; // Assuming the relationship uses a User ID

  @IsOptional()
  UpdatedBy?: number; // Assuming the relationship uses a User ID
}
