import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsDecimal, IsNumber } from 'class-validator';
import { Category } from 'src/class/entities/category.entity';
import { ClassType } from 'src/class/entities/classtype.entity';
import { User } from 'src/user/entities/user.entity';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  courseName: string;

  @IsNotEmpty()
  @IsString()
  shortName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isGuestAccess: boolean = false;

  @IsNotEmpty()
  createdBy: User; // Assuming the user object is passed, but this could be a user ID instead

  @IsOptional()
  @IsBoolean()
  isVisible: boolean = true;

  @IsOptional()
  @IsBoolean()
  isDelete: boolean = false;

  @IsOptional()
  @IsInt()
  courseDuration?: number; // duration in hours or another unit

  @IsNotEmpty()
  classType: number; // Could be an ID or the whole classType object

  @IsOptional()
  @IsDecimal()
  price?: number;


  @IsOptional()
  coverImage: string;

  @IsOptional()
  @IsDecimal()
  extPrice?: number;

  @IsNotEmpty()
  @IsInt()
  categoryId: number; // Assuming category ID is passed rather than the whole category object
}
