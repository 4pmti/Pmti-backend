import { Module } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizeNetService } from 'src/common/services/authorizenet.service';
import { User } from 'src/user/entities/user.entity';
import { Enrollment } from './entities/enrollment.entity';
import { Promotions } from 'src/promotions/entities/promotion.entity';
import { Student } from 'src/student/entities/student.entity';
import { Class } from 'src/class/entities/class.entity';
import { Course } from 'src/course/entities/course.entity';
import { UserService } from 'src/user/user.service';
import { BcryptService } from 'src/common/util/bcrypt.service';
import { Country } from 'src/country/entities/country.entity';
import { Instructor } from 'src/instructor/entities/instructor.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { EmailService } from 'src/common/services/email.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Enrollment,
      Promotions,
      Student,
      Class,
      Course,
      Instructor,
      Admin,
      Country
    ])
  ],
  controllers: [EnrollmentController],
  providers: [
    EnrollmentService,
    AuthorizeNetService,
    UserService,
    BcryptService,
    EmailService
  ],
  exports: [EnrollmentService]
})
export class EnrollmentModule { }