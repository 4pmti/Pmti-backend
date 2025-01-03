import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthorizeNetService } from 'src/common/services/authorizenet.service';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { Promotions } from 'src/promotions/entities/promotion.entity';
import { Student } from 'src/student/entities/student.entity';
import { Class } from 'src/class/entities/class.entity';
import { Course } from 'src/course/entities/course.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class EnrollmentService {

  constructor(
    private readonly dataSource: DataSource,
    private authorizeNetService: AuthorizeNetService,
    private readonly userService: UserService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Promotions)
    private promotionsRepository: Repository<Promotions>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) { }


  async create(createEnrollmentDto: CreateEnrollmentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {

      console.log(createEnrollmentDto);
      //validate the class and course
      if (createEnrollmentDto.classId && createEnrollmentDto.courseId) {
        throw new NotFoundException("Either Class or Course is required");
      }
      let enrollmentTarget;
      if (createEnrollmentDto.courseId) {
        enrollmentTarget = await queryRunner.manager.findOne(Course, {
          where: {
            id: createEnrollmentDto.courseId
          }
        });
        if (!enrollmentTarget) {
          throw new NotFoundException("Course not found");
        }
      } else if (createEnrollmentDto.classId) {
        enrollmentTarget = await queryRunner.manager.findOne(Class, {
          where: {
            id: createEnrollmentDto.classId
          }
        });
        if (!enrollmentTarget) {
          throw new NotFoundException("Class not found");
        }
      }


      //validate the student
      let student = await queryRunner.manager.findOne(Student, {
        where: {
          email: createEnrollmentDto.email
        }
      });
      if (!student) {
      try{
       student = await this.userService.createStudent({
          name: createEnrollmentDto.name,
          email: createEnrollmentDto.email,
          address: createEnrollmentDto.address,
          zipCode: createEnrollmentDto.zipCode,
          city: createEnrollmentDto.city,
          phone: createEnrollmentDto.phone,
          state: createEnrollmentDto.state,
          country: createEnrollmentDto.country,
          profession: createEnrollmentDto.profession || null,
          companyName: createEnrollmentDto.companyName || null,
          referredBy: '',
          password: '',
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
      }









      return "ok";
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return `This action returns all enrollment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} enrollment`;
  }

  update(id: number, updateEnrollmentDto: UpdateEnrollmentDto) {
    return `This action updates a #${id} enrollment`;
  }

  remove(id: number) {
    return `This action removes a #${id} enrollment`;
  }
}
