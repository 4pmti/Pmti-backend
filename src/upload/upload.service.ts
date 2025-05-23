import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createHash } from 'crypto';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ObjectCannedACL,
  ListObjectsV2CommandOutput,
  ListObjectsV2Command,
  GetObjectCommand,
  _Object as S3Object
} from '@aws-sdk/client-s3';



@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);
  private s3Client: S3Client;
  bucketName: string;

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

  // async listObjects(options: ListObjectsOptions = {}): Promise<ListObjectsResponse> {
  //   try {
  //     const command = new ListObjectsV2Command({
  //       Bucket: this.bucketName,
  //       Prefix: options.prefix,
  //       MaxKeys: options.maxKeys || 1000,
  //       ContinuationToken: options.continuationToken,
  //     });

  //     const response: ListObjectsV2CommandOutput = await this.s3Client.send(command);

  //     const objects = await Promise.all((response.Contents || []).map(async (object) => {
  //       const url = await this.getObjectUrl(object);
  //       return {
  //         key: object.Key,
  //         url,
  //         size: object.Size,
  //         lastModified: object.LastModified,
  //         isPublic: await this.isObjectPublic(object.Key)
  //       };
  //     }));

  //     return {
  //       objects,
  //       nextContinuationToken: response.NextContinuationToken,
  //       isTruncated: response.IsTruncated
  //     };
  //   } catch (error) {
  //     this.logger.error(`Failed to list objects: ${error}`, error);
  //     throw new Error('Failed to list objects from S3');
  //   }
  // }
  // private async getObjectUrl(object: S3Object): Promise<string> {
  //   const isPublic = await this.isObjectPublic(object.Key);
  //   return isPublic ? 
  //     this.getPublicUrl(object.Key) : 
  //     await this.getSignedUrl(object.Key);
  // }

  // private async isObjectPublic(key: string): Promise<boolean> {
  //   try {
  //     const command = new GetObjectCommand({
  //       Bucket: this.bucketName,
  //       Key: key,
  //     });
  //     const response = await this.s3Client.send(command);
  //     return true;
  //   } catch {
  //     return false;
  //   }
  // }


  /**
 * Get public URL for an object
 */
  private getPublicUrl(key: string): string {
    return `https://${this.configService.get<string>('s3.bucket')}.s3.${this.configService.get<string>('s3.region')}.amazonaws.com/${key}`;
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
    isPublic?: boolean,
    unique?: boolean
  ): Promise<{ key: string; url: string }> {
    try {

      let key = filename;
      if (unique) {
        key = this.generateKey(filename);
      }
      const command = new PutObjectCommand({
        Bucket: this.configService.get<string>('s3.bucket'),
        Key: key,
        Body: file,
        ContentType: contentType,
        ACL: isPublic ? ObjectCannedACL.public_read : ObjectCannedACL.private,
      });

      await this.s3Client.send(command);

      const url = isPublic
        ? this.getPublicUrl(key)
        : await this.getSignedUrl(key);
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
