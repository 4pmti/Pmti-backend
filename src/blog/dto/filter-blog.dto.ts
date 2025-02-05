import { IsInt, IsOptional, IsString, Min, IsArray, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterBlogDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1; // Default page = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = 10; // Default limit = 10

  @IsOptional()
  @IsString()
  search?: string; // For title/content search

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]; // Filter by tags

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number; // Filter by user
}
