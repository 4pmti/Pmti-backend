import { Injectable } from '@nestjs/common';
import { CreateCourseEnrollmentDto } from './dto/create-course-enrollment.dto';
import { UpdateCourseEnrollmentDto } from './dto/update-course-enrollment.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { AuthorizeNetService } from 'src/common/services/authorizenet.service';
import { CourseEnrollment } from './entities/course-enrollment.entity';

@Injectable()
export class CourseEnrollmentsService {

  constructor(
    private readonly datasource: DataSource,
    private authorizeNetService:AuthorizeNetService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(CourseEnrollment)
    private courseEnrollmentRepository: Repository<CourseEnrollment>
  ) { }


  create(createCourseEnrollmentDto: CreateCourseEnrollmentDto) {
    return 'This action adds a new courseEnrollment';
  }

  findAll() {
    return `This action returns all courseEnrollments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} courseEnrollment`;
  }

  update(id: number, updateCourseEnrollmentDto: UpdateCourseEnrollmentDto) {
    return `This action updates a #${id} courseEnrollment`;
  }

  remove(id: number) {
    return `This action removes a #${id} courseEnrollment`;
  }
}
