import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ConfigModule } from '@nestjs/config';
import s3Config from '../config/s3';

@Module({
  imports : [
    ConfigModule.forFeature(s3Config),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}


