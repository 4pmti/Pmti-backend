import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';

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
  @IsNumber()
  isDelete?: boolean;

  @IsOptional()
  @IsNumber()
  active?: boolean;

  @IsNumber()
  @IsNotEmpty()
  promotionType: number;
}
