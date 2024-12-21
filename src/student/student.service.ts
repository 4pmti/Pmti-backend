import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) { }

  findAll(): Promise<Student[]> {
    return this.studentRepository.find();
  }

  async findOne(id: number): Promise<Student> {

    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) {
      throw new Error('Student not found');
    }
    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto): Promise<Student> {
    try {
      const student = await this.studentRepository.findOne({
        where: {
          id: id
        }
      });

      if (!student) {
        throw new Error('Student not found');
      }
      Object.assign(student, updateStudentDto);
      return await this.studentRepository.save(student);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async remove(id: number): Promise<String> {
     try{
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
     } catch(error){
       throw error;
     }
  }
}
