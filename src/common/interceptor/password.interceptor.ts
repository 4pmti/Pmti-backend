import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  
  @Injectable()
  export class ExcludePasswordInterceptor implements NestInterceptor {
    private removePasswordFields(obj: any): any {
      // Return immediately if null, undefined, or not an object
      if (!obj || typeof obj !== 'object') {
        return obj;
      }
  
      // Handle arrays
      if (Array.isArray(obj)) {
        return obj.map(item => this.removePasswordFields(item));
      }
  
      // Skip if it's a Date instance
      if (obj instanceof Date) {
        return obj;
      }
  
      // Create a shallow copy of the object
      const result = { ...obj };
  
      // Remove only password-related fields
      if ('password' in result) delete result.password;
      if ('hashedPassword' in result) delete result.hashedPassword;
  
      // Process each property recursively
      Object.keys(result).forEach(key => {
        if (result[key] && typeof result[key] === 'object') {
          // Skip processing if it's a Date
          if (result[key] instanceof Date) {
            return;
          }
          result[key] = this.removePasswordFields(result[key]);
        }
      });
  
      return result;
    }
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
        map(data => this.removePasswordFields(data))
      );
    }
  }