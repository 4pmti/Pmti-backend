import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsNumber, Min, Max } from "class-validator";

export class PresignedUrlDto {
    @ApiProperty({
      description: 'File key in S3'
    })
    @IsString()
    key: string;
  
    @ApiPropertyOptional({
      description: 'URL expiration time in seconds',
      minimum: 60,
      maximum: 604800, // 7 days
      default: 3600
    })
    @IsOptional()
    @IsNumber()
    @Min(60)
    @Max(604800)
    expiresIn?: number;
  }
  