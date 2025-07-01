import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { UploadService } from './upload.service';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadDto } from './dto/file-upload.dto';
import sharp from 'sharp';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: FileUploadDto) {
    try {
      if (!file) {
        throw new BadRequestException('File is required');
      }

      // Validate file type based on mime type
      if (!this.isValidFileType(file.mimetype)) {
        throw new BadRequestException(`Invalid file type: ${file.mimetype}`);
      }

      let processedFile = file;
      
      // Convert image to webp if it's an image file
      if (this.isImageFile(file.mimetype)) {
        const webpBuffer = await sharp(file.buffer)
          .webp({ quality: 90 }) // High quality webp conversion
          .toBuffer();
        
        // Update file properties for webp
        processedFile = {
          ...file,
          buffer: webpBuffer,
          originalname: this.changeExtensionToWebp(file.originalname),
          mimetype: 'image/webp'
        };
      }

      const unique = uploadDto.unique === 'true';
      console.log(unique);

      const { key, url } = await this.uploadService.uploadFile(
        processedFile.buffer,
        processedFile.originalname,
        processedFile.mimetype,
        true,
        unique
      );

      return {
        key,
        url,
        filename: processedFile.originalname,
        size: processedFile.buffer.length,
        mimeType: processedFile.mimetype
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private isValidFileType(mimeType: string): boolean {
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/avif',
      'image/bmp',
      'image/tiff',
      'application/pdf',
      // Add more as needed
    ];
    return validTypes.includes(mimeType);
  }

  private isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  private changeExtensionToWebp(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return `${filename}.webp`;
    }
    return `${filename.substring(0, lastDotIndex)}.webp`;
  }
}
