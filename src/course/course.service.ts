import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { ClassType } from 'src/class/entities/classtype.entity';
import { Category } from 'src/class/entities/category.entity';
import { Role } from 'src/common/enums/role';
import { Course } from './entities/course.entity';

@Injectable()
export class CourseService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ClassType)
    private readonly classTypeRepository: Repository<ClassType>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>


  ) { }


  async create(createCourseDto: CreateCourseDto, userId: string) {
    try {
      console.log(createCourseDto);
      const user = await this.userRepository.findOne({
        where: {
          id: userId
        }
      },
      
    
    );
      if (user.role != Role.ADMIN) {
        throw new UnauthorizedException("You dont have access to do this operation");
      }
      const category = await this.categoryRepository.findOne({
        where: {
          id: createCourseDto.categoryId
        }
      });
      if (!category) {
        throw new NotFoundException("Category not found");
      }
      const classtype = await this.classTypeRepository.findOne({
        where: {
          id: createCourseDto.classType
        }
      });
      if (!classtype) {
        throw new NotFoundException("ClassType not found");
      }

      const course = new Course();
      Object.assign(course, createCourseDto);
      course.category = category;
      course.classType = classtype;
      course.createdBy = user;
      course.updatedBy = user;
      return await this.courseRepository.save(course);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  findAll() {
    return `This action returns all course`;
  }

  findOne(id: number) {
    return `This action returns a #${id} course`;
  }

  update(id: number, updateCourseDto: UpdateCourseDto) {
    return `This action updates a #${id} course`;
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }
}
