import {
    Catch,
    ArgumentsHost,
    ExceptionFilter,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
import { ResponseDto } from '../dto/response.dto';
  
  
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
  
      const message =
        exception instanceof HttpException
          ? exception.message
          : 'Internal server error';
  
      const error = exception instanceof Error ? exception.message : '';
  
      const responseBody = new ResponseDto(
        message,
        error,
        false,
        null,
      );
  
      response.status(status).json(responseBody);
    }
  }
  