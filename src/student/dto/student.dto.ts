import { IsString, IsOptional, IsEmail, IsInt, IsBoolean, IsDateString } from 'class-validator';

export class StudentDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  // add the state join

  @IsString()
  state: string;

  // add the country join
  @IsString()
  country: string;

  @IsString()
  zipCode: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  profession?: string;

  @IsOptional()
  @IsString()
  referredBy?: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsDateString()
  signupDate: string;

  @IsInt()
  downloadedImfopac: number;

  @IsOptional()
  @IsString()
  addedBy?: string | (() => string);

  @IsOptional()
  @IsString()
  updatedBy?: string | (() => string);

  @IsBoolean()
  isDelete: boolean;

  @IsBoolean()
  active: boolean;

  @IsOptional()
  @IsDateString()
  lastLogin?: string;

  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @IsOptional()
  @IsDateString()
  updatedAt?: string;
}
