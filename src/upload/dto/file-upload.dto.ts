import { IsString, IsOptional, IsEnum, MaxLength, IsNumber, Max, Min, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Express } from 'express';

export enum AllowedFileTypes {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio'
}

export class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;

  @ApiProperty({
    enum: AllowedFileTypes,
    description: 'Type of file being uploaded'
  })
  @IsOptional()
  @IsEnum(AllowedFileTypes)
  fileType: AllowedFileTypes;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    description: 'Original filename'
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  filename: string;

  @ApiPropertyOptional({
    description: 'Optional description of the file'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Custom path within the bucket'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  path?: string;
}
