import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createHash } from 'crypto';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';



@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);
  private s3Client: S3Client;

  constructor(private configService: ConfigService) { }

  onModuleInit() {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('s3.region'),
      credentials: {
        accessKeyId: this.configService.get<string>('s3.accessKeyId'),
        secretAccessKey: this.configService.get<string>('s3.secretAccessKey'),
      },
    });
  }

  private generateKey(filename: string): string {
    const timestamp = Date.now();
    const hash = createHash('sha256')
      .update(`${filename}${timestamp}`)
      .digest('hex')
      .substring(0, 8);
    return `${hash}-${filename}`;
  }

  async uploadFile(
    file: Buffer,
    filename: string,
    contentType: string,
  ): Promise<{ key: string; url: string }> {
    try {
      const key = this.generateKey(filename);
      const command = new PutObjectCommand({
        Bucket: this.configService.get<string>('s3.bucket'),
        Key: key,
        Body: file,
        ContentType: contentType,
      });

      await this.s3Client.send(command);

      const url = await this.getSignedUrl(key);
      return { key, url };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error}`, error);
      throw new Error('Failed to upload file to S3');
    }
  }

  /**
   * Generates a pre-signed URL for downloading a file
   */
  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.configService.get<string>('s3.bucket'),
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error(`Failed to generate signed URL: ${error}`, error);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Deletes a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.configService.get<string>('s3.bucket'),
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error}`, error);
      throw new Error('Failed to delete file from S3');
    }
  }
}
