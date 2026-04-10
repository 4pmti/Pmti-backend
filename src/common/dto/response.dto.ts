import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
    @ApiProperty({ example: 'Operation successful', description: 'Human-readable response message' })
    message: string;

    @ApiProperty({ example: '', description: 'Error message (empty on success)' })
    error: string;

    @ApiProperty({ example: true, description: 'Whether the operation was successful' })
    success: boolean;

    @ApiProperty({ description: 'Response payload (null on error)', nullable: true })
    data: T | null;

    constructor(message: string, error: string = '', success: boolean = true, data: T | null = null) {
      this.message = message;
      this.error = error;
      this.success = success;
      this.data = data;
    }
  }