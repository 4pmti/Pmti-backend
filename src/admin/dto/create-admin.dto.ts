import { IsString, IsBoolean, IsEmail, IsOptional, Length, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAdminDto {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsString()
  @Length(1, 255)
  designation: string;

  @IsString()
  @Length(1, 15)
  phone: string;

  @IsEmail()
  @Length(1, 255)
  email: string;

  @IsOptional()
  countryId: number;

  @IsBoolean()
  @IsOptional()
  isSuperAdmin?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @Length(8, 255) 
  password: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  lastlogin?: Date;
}
