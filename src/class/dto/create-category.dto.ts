import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(355)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
