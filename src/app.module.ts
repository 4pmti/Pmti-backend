import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StudentModule } from './student/student.module';
import { AuthModule } from './auth/auth.module';
import { CountryModule } from './country/country.module';
import typeorm from './config/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    AdminModule,
    StudentModule,
    AuthModule,
    CountryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
