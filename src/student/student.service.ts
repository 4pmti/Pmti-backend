import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';
import { Country } from 'src/country/entities/country.entity';
import { State } from 'src/state/entities/state.entity';
import { Location } from 'src/location/entities/location.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
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
    try{

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
        throw new Error('Student not found');
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

      // Check if city/location exists if it's being updated
      // if (updateStudentDto.city) {
      //   const city = await this.locationRepository.findOne({ 
      //     where: { id: updateStudentDto.city }
      //   });
      //   if (!city) {
      //     throw new Error('City not found');
      //   }
      //   student.city = city;
      // }

      Object.assign(student, updateStudentDto);
      return await this.studentRepository.save(student);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async remove(id: number): Promise<String> {
    try {
      const student = await this.studentRepository.findOne({
        where: {
          id: id
        }
      });
      if (!student) {
        throw new Error('Student not found');
      }
      await this.studentRepository.remove(student);
      return "Successfully deleted";
    } catch (error) {
      throw error;
    }
  }
}
