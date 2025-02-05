import { IsArray, IsNotEmpty, IsOptional, IsString, IsInt, ArrayUnique } from 'class-validator';

export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique() 
  @IsString({ each: true }) // Validates each element in the array as a string
  tagNames?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique() // Ensures unique article IDs
  @IsInt({ each: true }) // Validates each element as an integer
  relatedArticleIds?: number[];
}
