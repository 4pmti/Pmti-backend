import { Module } from '@nestjs/common';
import { CourseEnrollmentsService } from './course-enrollments.service';
import { CourseEnrollmentsController } from './course-enrollments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { AuthorizeNetService } from 'src/common/services/authorizenet.service';
import { CourseEnrollment } from './entities/course-enrollment.entity';

@Module({
  controllers: [CourseEnrollmentsController],
  providers: [CourseEnrollmentsService, AuthorizeNetService],
  imports: [TypeOrmModule.forFeature([User, CourseEnrollment])]
})
export class CourseEnrollmentsModule { }
