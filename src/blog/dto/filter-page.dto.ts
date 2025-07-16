import { IsInt, IsOptional, IsString, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterPageDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string; // For name/description search
} 