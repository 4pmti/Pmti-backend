import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { AllExceptionsFilter } from './common/exceptions/exception.filter';
import { ExcludePasswordInterceptor } from './common/interceptor/password.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalInterceptors(new ExcludePasswordInterceptor());
  app.useGlobalPipes(new ValidationPipe({
    transform: true
  }
  ));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('PMTI Backend API')
    .setDescription(
      'API documentation for the PMTI (Project Management Training Institute) backend. ' +
      'All responses are wrapped in a standard envelope: `{ success, message, error, data }`.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .addTag('Health', 'Application health check')
    .addTag('Auth', 'Authentication and user signup')
    .addTag('Admin', 'Admin user management')
    .addTag('Student', 'Student management')
    .addTag('Instructor', 'Instructor management')
    .addTag('Course', 'Course management')
    .addTag('Class', 'Class scheduling and management')
    .addTag('Category', 'Class category management')
    .addTag('ClassType', 'Class type management')
    .addTag('Enrollment', 'Student enrollment (online, offline, reschedule)')
    .addTag('Payment', 'Payment processing via Authorize.Net')
    .addTag('Promotions', 'Promotion code and discount management')
    .addTag('Blog', 'Blog and page content management')
    .addTag('Reviews', 'Customer review management')
    .addTag('Country', 'Country management')
    .addTag('State', 'State management')
    .addTag('Location', 'Location management')
    .addTag('Upload', 'File upload (images, documents)')
    .addTag('Misc', 'Miscellaneous endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(25769, () => {
    //console("Server Started on Port 25769");
  });
}
bootstrap();
