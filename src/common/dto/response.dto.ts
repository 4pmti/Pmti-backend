export class ResponseDto<T> {
    message: string;
    error: string;
    success: boolean;
    data: T | null;
    
    constructor(message: string, error: string = '', success: boolean = true, data: T | null = null) {
      this.message = message;
      this.error = error;
      this.success = success;
      this.data = data;
    }
  }