import { Module } from '@nestjs/common';
import { CourseEnrollmentsService } from './course-enrollments.service';
import { CourseEnrollmentsController } from './course-enrollments.controller';

@Module({
  controllers: [CourseEnrollmentsController],
  providers: [CourseEnrollmentsService],
})
export class CourseEnrollmentsModule {}
