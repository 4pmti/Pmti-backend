import { PartialType } from '@nestjs/swagger';
import { CreateEnrollmentDto } from './create-enrollment.dto';
import { IsOptional, IsString, IsEnum, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { enrollmentMeal, enrollmentProgress } from 'src/common/enums/enums';
import { Type } from 'class-transformer';

export class UpdateEnrollmentDto {
    @IsOptional()
    @IsEnum(enrollmentMeal)
    MealType?: enrollmentMeal;
  
    @IsOptional()
    @IsEnum(enrollmentProgress)
    enrollmentProgress?: enrollmentProgress;
  
    @IsOptional()
    @IsBoolean()
    status?: boolean;
  
    @IsOptional()
    @IsBoolean()
    pmbok?: boolean;
  }

  export class BulkUpdateEnrollmentDto {
    @IsArray()
    @IsString({ each: true })
    ids: string[]; 
  
    @ValidateNested()
    @Type(() => UpdateEnrollmentDto)
    changes: UpdateEnrollmentDto; 
  }
  
  