import { Module } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizeNetService } from 'src/common/services/authorizenet.service';
import { User } from 'src/user/entities/user.entity';
import { Enrollment } from './entities/enrollment.entity';

@Module({
  controllers: [EnrollmentController],
   providers: [EnrollmentService, AuthorizeNetService],
    imports: [TypeOrmModule.forFeature([User, Enrollment])]
})
export class EnrollmentModule {}
