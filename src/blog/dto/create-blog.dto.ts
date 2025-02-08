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
  @IsString({ each: true })
  tagNames?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique() 
  @IsInt({ each: true }) 
  relatedArticleIds?: number[];
}
