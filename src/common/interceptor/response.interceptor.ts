import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
import { ResponseDto } from '../dto/response.dto';
  
  @Injectable()
  export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseDto<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseDto<T>> {
      return next.handle().pipe(
        map((data) => {
          if (data instanceof ResponseDto) {
            return data; // If the data is already in the correct format, return it
          }
  
          // For other data, wrap it in a ResponseDto
          return new ResponseDto<T>('Request successful', '', true, data);
        }),
      );
    }
  }
  