import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { UploadService } from './upload.service';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileUploadDto } from './dto/file-upload.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post()
  @ApiOperation({ summary: 'Upload a file to S3' })
  @ApiConsumes('multipart/form-data')
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

      const { key, url } = await this.uploadService.uploadFile(
        file.buffer,
        file.originalname, 
        file.mimetype
      );

      return {
        key,
        url,
        filename: file.originalname,
        size: file.size,
        mimeType: file.mimetype
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Get()
  findAll() {
   // return this.uploadService.findAll();
  }
  private isValidFileType(mimeType: string): boolean {
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      // Add more as needed
    ];
    return validTypes.includes(mimeType);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
  //  return this.uploadService.remove(+id);
  }
}
