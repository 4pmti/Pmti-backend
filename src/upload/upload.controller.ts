import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadDto } from './dto/file-upload.dto';
import sharp from 'sharp';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file', description: 'Upload an image, document, video or font file. Images are automatically converted to WebP format.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload with metadata',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'The file to upload' },
        fileType: { type: 'string', enum: ['IMAGE', 'DOCUMENT', 'VIDEO', 'AUDIO'], description: 'Type of file being uploaded' },
        isPublic: { type: 'string', example: 'true', description: 'Whether the file should be publicly accessible' },
        unique: { type: 'string', example: 'true', description: 'Generate a unique filename' },
        path: { type: 'string', description: 'Custom storage path' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully. Returns key, url, filename, size, and mimeType.' })
  @ApiResponse({ status: 400, description: 'No file provided or invalid file type' })
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
      //console(unique);

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
      'image/heic',
      'video/mp4',
      'video/mov',
      'video/avi',
      'video/wmv',
      'video/flv',
      'video/webm',
      'video/mkv',
      'image/bmp',
      'image/tiff',
      'application/pdf',
      // Font types
      'application/font-ttf',
      'font/ttf',
      'application/font-otf',
      'font/otf',
      'application/font-woff',
      'font/woff',
      'application/font-woff2',
      'font/woff2',
      'application/x-font-ttf',
      'application/x-font-otf',
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
