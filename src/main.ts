import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { AllExceptionsFilter } from './common/exceptions/exception.filter';
import { ExcludePasswordInterceptor } from './common/interceptor/password.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ExcludePasswordInterceptor());
  
  await app.listen(3000,()=>{
        console.log("Server Started on Port 3000");
  });
}
bootstrap();
