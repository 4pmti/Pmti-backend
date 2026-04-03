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

    let errorMessage = 'Something went wrong!';
    let data: unknown = null;

    if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse();
      if (typeof errorResponse === 'object' && errorResponse !== null) {
        const er = errorResponse as Record<string, unknown>;
        const msg = er.message;
        if (typeof msg === 'string') {
          errorMessage = msg;
        } else if (Array.isArray(msg)) {
          errorMessage = msg.join(', ');
        }

        // Forward custom payload fields (e.g. `classes` on ConflictException) into `data`.
        const reservedKeys = new Set(['message', 'statusCode', 'error']);
        const extras: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(er)) {
          if (!reservedKeys.has(key)) {
            extras[key] = value;
          }
        }
        if (Object.keys(extras).length > 0) {
          data = extras;
        }
      }
    }

    const responseBody = new ResponseDto(
      message,
      errorMessage,
      false,
      data,
    );

    response.status(status).json(responseBody);
  }
}
