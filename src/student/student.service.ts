import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';
import { Country } from 'src/country/entities/country.entity';
import { State } from 'src/state/entities/state.entity';
import { Location } from 'src/location/entities/location.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { User } from 'src/user/entities/user.entity';
import { isAdmin } from 'src/common/util/utilities';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) { }

  async findAll(): Promise<Student[]> {
    return await this.studentRepository.find({
      relations: {
        country: true,
        state: true,
      }
    });
  }

  async findOne(id: number): Promise<{ student: Student, enrollments: Enrollment[] }> {
    try {

      const student = await this.studentRepository.findOne({
        where: { id }, relations: {
          country: true,
          state: true,
        }
      });
      if (!student) {
        throw new BadRequestException('Student not found');
      }

      const enrollments = await this.enrollmentRepository.
        find({
          where: { student: { id } }, relations: {
            course: true, class: {
              instructor: true
            }
          }
        });

      return { student, enrollments };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(id: number, updateStudentDto: UpdateStudentDto): Promise<Student> {
    try {
      const student = await this.studentRepository.findOne({
        where: {
          id: id
        },
        relations: {
          country: true,
          state: true
        }
      });

      if (!student) {
        throw new BadRequestException('Student not found');
      }

      if (updateStudentDto.email) {
        const existingStudent = await this.studentRepository.findOne({
          where: { email: updateStudentDto.email }
        });
        if (existingStudent) {
          throw new BadRequestException('Email already exists');
        }
      }

      // Check if country exists if it's being updated
      if (updateStudentDto.country) {
        const country = await this.countryRepository.findOne({
          where: { id: updateStudentDto.country }
        });
        if (!country) {
          throw new Error('Country not found');
        }
        student.country = country;
      }

      // Check if state exists if it's being updated
      if (updateStudentDto.state) {
        const state = await this.stateRepository.findOne({
          where: { id: updateStudentDto.state }
        });
        if (!state) {
          throw new Error('State not found');
        }
        student.state = state;
      }
      Object.assign(student, updateStudentDto);
      return await this.studentRepository.save(student);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async remove(userId: string, id: number): Promise<String> {
    // Use transaction to ensure atomicity of all operations

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      // Start transaction
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
      if (!user || !isAdmin(userId, this.userRepository)) {
        throw new UnauthorizedException('You don’t have permission to perform this action.');
      }

      // First, check if the student exists with all relations
      const student = await queryRunner.manager.findOne(Student, {
        where: { id: id },
        relations: ['user', 'country', 'state'] // Include all necessary relationships
      });

      if (!student) {
        throw new Error('Student not found');
      }

      // Check for related enrollments before deletion
      const relatedEnrollments = await queryRunner.manager.find(Enrollment, {
        where: { student: { id: id } }
      });

      if (relatedEnrollments.length > 0) {
        throw new Error(`Cannot delete student. Student has ${relatedEnrollments.length} active enrollment(s). Please delete enrollments first.`);
      }

      // Check for related user record and delete it first (due to OneToOne relationship)
      if (student.user) {
        try {
          await queryRunner.manager.remove(User, student.user);
        } catch (userError) {
          console.error('Error deleting associated user:', userError);
          throw new Error('Failed to delete associated user record. Please try again.');
        }
      }

      // Now safely delete the student
      await queryRunner.manager.remove(Student, student);

      // Commit transaction
      await queryRunner.commitTransaction();

      return "Successfully deleted student and related records";
    } catch (error) {
      // Rollback transaction on any error
      await queryRunner.rollbackTransaction();

      // Log the error for debugging
      console.error('Error deleting student:', error);

      // Re-throw with more descriptive message
      if (error instanceof Error && error.message.includes('Cannot delete student')) {
        throw error; // Re-throw the specific enrollment error
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to delete student: ${errorMessage}`);
    } finally {
      // Always release the query runner
      await queryRunner.release();
    }
  }
}
