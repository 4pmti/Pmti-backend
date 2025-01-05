import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { AllExceptionsFilter } from './common/exceptions/exception.filter';
import { ExcludePasswordInterceptor } from './common/interceptor/password.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ExcludePasswordInterceptor());
  // app.useGlobalPipes(new ValidationPipe({
  //   whitelist: true,
  //   forbidNonWhitelisted: true,
  //   transform: true
  // }));
  app.enableCors();
  
  await app.listen(25769,()=>{
        console.log("Server Started on Port 25769");
  });
}
bootstrap();
