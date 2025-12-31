import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import * as SftpClient from 'ssh2-sftp-client';
import { readFileSync } from 'fs';



/**
 * Upload service that handles file uploads to SFTP server using SSH key authentication
 * Replaces the previous S3 implementation with SFTP functionality
 * 
 * Features:
 * - Secure SFTP connections with SSH key authentication
 * - Automatic directory creation
 * - File upload with unique naming
 * - File deletion
 * - Connection testing
 * - Comprehensive error handling
 */
@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);
  private sftpConfig: {
    host: string;
    port: number;
    username: string;
    privateKey: string;
    passphrase?: string;
    basePath: string;
    baseUrl: string;
  };

  constructor(private configService: ConfigService) {}

  /**
   * Initialize SFTP configuration on module initialization
   * Validates all required configuration parameters
   */
  onModuleInit() {
    this.sftpConfig = {
      host: this.configService.get<string>('ftp.host'),
      port: this.configService.get<number>('ftp.port'),
      username: this.configService.get<string>('ftp.username'),
      privateKey: this.configService.get<string>('ftp.privateKey'),
      passphrase: this.configService.get<string>('ftp.passphrase'),
      basePath: this.configService.get<string>('ftp.basePath'),
      baseUrl: this.configService.get<string>('ftp.baseUrl'),
    };

    // Validate required SFTP configuration
    if (!this.sftpConfig.host || !this.sftpConfig.username || !this.sftpConfig.privateKey) {
      this.logger.error('SFTP configuration is incomplete. Please check your environment variables.');
      throw new Error('SFTP configuration is incomplete');
    }

    this.logger.log(`SFTP configuration initialized for host: ${this.sftpConfig.host}`);
  }

  /**
   * Create SFTP client with proper configuration
   * @returns Configured SFTP client instance
   */
  private createSftpClient(): SftpClient {
    const client = new SftpClient();
    return client;
  }

  /**
   * Get SFTP connection configuration
   * @returns SFTP connection options
   */
  private getSftpConnectionOptions() {
    return {
      host: this.sftpConfig.host,
      port: this.sftpConfig.port,
      username: this.sftpConfig.username,
      privateKey: readFileSync(this.sftpConfig.privateKey),
      passphrase: this.sftpConfig.passphrase,
    };
  }

  /**
   * Get public URL for an uploaded file
   * @param key - File key/name
   * @returns Public URL to access the file
   */
  private getPublicUrl(key: string): string {
    return `${this.sftpConfig.baseUrl}/${key}`;
  }


  /**
   * Generate a unique key for the file to avoid conflicts
   * Uses timestamp and SHA256 hash for uniqueness
   * @param filename - Original filename
   * @returns Unique filename with hash prefix
   */
  private generateKey(filename: string): string {
    const timestamp = Date.now();
    const hash = createHash('sha256')
      .update(`${filename}${timestamp}`)
      .digest('hex')
      .substring(0, 8);
    return `${hash}-${filename}`;
  }

  /**
   * Upload file to SFTP server
   * @param file - File buffer to upload
   * @param filename - Original filename
   * @param contentType - MIME type of the file
   * @param isPublic - Whether the file should be publicly accessible (always true for SFTP)
   * @param unique - Whether to generate a unique filename
   * @returns Object containing the file key and public URL
   */
  async uploadFile(
    file: Buffer,
    filename: string,
    contentType: string,
    isPublic: boolean = true,
    unique: boolean = false
  ): Promise<{ key: string; url: string }> {
    const client = this.createSftpClient();
    
    try {
      // Connect to SFTP server
      await client.connect(this.getSftpConnectionOptions());

      this.logger.log(`Connected to SFTP server: ${this.sftpConfig.host}`);

      // Generate file key
      let key = filename;
      if (unique) {
        key = this.generateKey(filename);
      }

      // Ensure base directory exists
      await this.ensureDirectoryExists(client, this.sftpConfig.basePath);

      // Upload file to SFTP server
      const remotePath = `${this.sftpConfig.basePath}/${key}`;
      await client.put(file, remotePath);

      this.logger.log(`File uploaded successfully: ${remotePath}`);

      // Generate public URL
      const url = this.getPublicUrl(key);

      return { key, url };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to upload file to SFTP: ${errorMessage}`, error);
      throw new Error(`Failed to upload file to SFTP: ${errorMessage}`);
    } finally {
      // Always close the SFTP connection
      try {
        await client.end();
      } catch (closeError) {
        const closeErrorMessage = closeError instanceof Error ? closeError.message : 'Unknown error';
        this.logger.warn(`Error closing SFTP connection: ${closeErrorMessage}`);
      }
    }
  }

  /**
   * Ensure directory exists on SFTP server, create if it doesn't
   * @param client - SFTP client instance
   * @param path - Directory path to ensure exists
   */
  private async ensureDirectoryExists(client: SftpClient, path: string): Promise<void> {
    try {
      // Try to list the directory to check if it exists
      await client.list(path);
    } catch (error) {
      // Directory doesn't exist, create it
      try {
        await client.mkdir(path, true); // true for recursive creation
        this.logger.log(`Created directory: ${path}`);
      } catch (createError) {
        const createErrorMessage = createError instanceof Error ? createError.message : 'Unknown error';
        this.logger.error(`Failed to create directory ${path}: ${createErrorMessage}`);
        throw createError;
      }
    }
  }

  /**
   * Delete file from SFTP server
   * @param key - File key/name to delete
   */
  async deleteFile(key: string): Promise<void> {
    const client = this.createSftpClient();
    
    try {
      // Connect to SFTP server
      await client.connect(this.getSftpConnectionOptions());

      const remotePath = `${this.sftpConfig.basePath}/${key}`;
      
      // Check if file exists before attempting to delete
      try {
        await client.stat(remotePath);
        await client.delete(remotePath);
        this.logger.log(`File deleted successfully: ${remotePath}`);
      } catch (error) {
        if ((error as any).code === 2) { // No such file error
          this.logger.warn(`File not found for deletion: ${remotePath}`);
        } else {
          throw error;
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to delete file from SFTP: ${errorMessage}`, error);
      throw new Error(`Failed to delete file from SFTP: ${errorMessage}`);
    } finally {
      // Always close the SFTP connection
      try {
        await client.end();
      } catch (closeError) {
        const closeErrorMessage = closeError instanceof Error ? closeError.message : 'Unknown error';
        this.logger.warn(`Error closing SFTP connection: ${closeErrorMessage}`);
      }
    }
  }

  /**
   * Get file information from SFTP server
   * @param key - File key/name
   * @returns File size and last modified date, or null if file doesn't exist
   */
  async getFileInfo(key: string): Promise<{ size: number; lastModified: Date } | null> {
    const client = this.createSftpClient();
    
    try {
      // Connect to SFTP server
      await client.connect(this.getSftpConnectionOptions());

      const remotePath = `${this.sftpConfig.basePath}/${key}`;
      
      try {
        const stats = await client.stat(remotePath);
        
        return { 
          size: stats.size, 
          lastModified: new Date(stats.modifyTime) 
        };
      } catch (error) {
        if ((error as any).code === 2) { // No such file error
          return null; // File not found
        }
        throw error;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get file info from SFTP: ${errorMessage}`, error);
      throw new Error(`Failed to get file info from SFTP: ${errorMessage}`);
    } finally {
      // Always close the SFTP connection
      try {
        await client.end();
      } catch (closeError) {
        const closeErrorMessage = closeError instanceof Error ? closeError.message : 'Unknown error';
        this.logger.warn(`Error closing SFTP connection: ${closeErrorMessage}`);
      }
    }
  }

  /**
   * Test SFTP connection
   * @returns True if connection is successful, false otherwise
   */
  async testConnection(): Promise<boolean> {
    const client = this.createSftpClient();
    
    try {
      await client.connect(this.getSftpConnectionOptions());

      this.logger.log('SFTP connection test successful');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`SFTP connection test failed: ${errorMessage}`, error);
      return false;
    } finally {
      try {
        await client.end();
      } catch (closeError) {
        const closeErrorMessage = closeError instanceof Error ? closeError.message : 'Unknown error';
        this.logger.warn(`Error closing SFTP connection: ${closeErrorMessage}`);
      }
    }
  }
}
