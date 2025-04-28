import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, IsBoolean, Min, IsPositive, Max } from 'class-validator';
import { Type } from 'class-transformer';
export class CreatePromotionDto {
  @IsNumber()
  @IsNotEmpty()
  countryId: number;

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @IsNumber()
  @IsNotEmpty()
  classTypeId: number;

  @IsString()
  @IsNotEmpty()
  promotionId: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Min(0)
  @Max(10000)
  amount: number;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  attachedFilePath?: string;

  @IsNumber()
  @IsNotEmpty()
  addedBy: number;

  @IsNumber()
  @IsNotEmpty()
  updatedBy: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isDelete?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  active?: boolean;

  @IsNumber()
  @IsNotEmpty()
  promotionType: number;
}
