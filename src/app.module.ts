import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StudentModule } from './student/student.module';
import { AuthModule } from './auth/auth.module';
import { CountryModule } from './country/country.module';
import typeorm from './config/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
// import { BcryptService } from './common/util/bcrypt.service';
import { ClassModule } from './class/class.module';
import { InstructorModule } from './instructor/instructor.module';
import { LocationModule } from './location/location.module';
import { CourseModule } from './course/course.module';
import { PaymentModule } from './payment/payment.module';
import { PromotionsModule } from './promotions/promotions.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { StateModule } from './state/state.module';
import { UploadModule } from './upload/upload.module';
import { BlogModule } from './blog/blog.module';
import { MiscModule } from './misc/misc.module';
import { ReviewsModule } from './reviews/reviews.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        // refering this file from config/typeorm.ts
        configService.get('typeorm'),
      inject: [ConfigService],
    }),
    AdminModule,
    StudentModule,
    AuthModule,
    CountryModule,
    UserModule,
    ClassModule,
    InstructorModule,
    LocationModule,
    CourseModule,
    PaymentModule,
    PromotionsModule,
    EnrollmentModule,
    StateModule,
    UploadModule,
    BlogModule,
    MiscModule,
    ReviewsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
