import { IsArray, IsNotEmpty, IsOptional, IsString, IsInt, ArrayUnique, IsObject } from 'class-validator';

export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  coverImage:string

  @IsNotEmpty()
  @IsString()
  thumbnail:string

  @IsOptional()
  @IsArray()
  @ArrayUnique() 
  @IsString({ each: true })
  tagNames?: string[];


  @IsOptional()
  @IsString()
  description?:string


  @IsOptional()
  @IsString()
  slug?:string

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;


  @IsOptional()
  @IsArray()
  @ArrayUnique() 
  @IsInt({ each: true }) 
  relatedArticleIds?: number[];

  @IsOptional()
  @IsArray()
  @ArrayUnique() 
  @IsInt({ each: true }) 
  pageIds?: number[];
}
