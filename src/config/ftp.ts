import { registerAs } from '@nestjs/config';

/**
 * SFTP Configuration for file uploads using SSH key authentication
 * Replaces S3 configuration with SFTP server settings
 */
export default registerAs('ftp', () => ({
  host: process.env.FTP_HOST,
  port: parseInt(process.env.FTP_PORT) || 22, // Default to 22 for SFTP
  username: process.env.FTP_USERNAME,
  privateKey: process.env.FTP_PRIVATE_KEY_PATH, // Path to PEM file
  passphrase: process.env.FTP_PASSPHRASE, // Optional passphrase for the key
  basePath: process.env.FTP_BASE_PATH || '/uploads', // Base directory on SFTP server
  baseUrl: process.env.FTP_BASE_URL, // Base URL for accessing uploaded files
}));
