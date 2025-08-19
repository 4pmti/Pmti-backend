import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { ClassType } from 'src/class/entities/classtype.entity';
import { Category } from 'src/class/entities/category.entity';
import { Role } from 'src/common/enums/role';
import { Course } from './entities/course.entity';
import { FilterDto } from 'src/class/dto/filter.dto';

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

      const user = await this.userRepository.findOne({
        where: {
          id: userId
        }
      },


      );
      if (!user.roles.includes(Role.ADMIN)) {
        throw new ForbiddenException("You don't have this permission!");
      }
      const category = await this.categoryRepository.findOne({
        where: {
          id: createCourseDto.categoryId
        }
      });
      if (!category) {
        throw new NotFoundException("Category not found");
      }

      const course = new Course();
      Object.assign(course, createCourseDto);
      course.category = category;
      course.createdBy = user;
      course.updatedBy = user;
      return await this.courseRepository.save(course);
    } catch (error) {
      //console(error);
      throw error;
    }
  }

  async findAll(filters: FilterDto) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        sort = 'createdAt:ASC',
        courseCategory,
        classType
      } = filters;

      // Create query builder
      const queryBuilder = this.courseRepository.createQueryBuilder('course')
        .leftJoinAndSelect('course.category', 'category')
        .leftJoinAndSelect('course.classType', 'classType')
        .loadRelationCountAndMap('course.enrollmentCount', 'course.enrollments');

      // Apply search if provided
      if (search) {
        queryBuilder.where(
          'LOWER(course.courseName) LIKE LOWER(:search) OR LOWER(course.description) LIKE LOWER(:search)',
          { search: `%${search}%` }
        );
      }
      // Apply sorting
      if (sort) {
        const [field, order] = sort.split(':');
        queryBuilder.orderBy(`course.${field}`, order as 'ASC' | 'DESC');
      }
      if (courseCategory) {
        queryBuilder.andWhere('course.category = :courseCategory', { courseCategory });
      }

      if (classType) {
        queryBuilder.andWhere('course.classType = :classType', { classType });
      }

      // Apply pagination
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);

      // Execute query and get total count
      const [classes, total] = await queryBuilder.getManyAndCount();

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);
      const currentPage = page;
      const hasNext = currentPage < totalPages;
      const hasPrevious = currentPage > 1;

      return {
        data: classes,
        metadata: {
          total,
          totalPages,
          currentPage,
          hasNext,
          hasPrevious,
          limit
        }
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new Error('Failed to fetch classes');
    }
  }

  async findOne(id: number) {
    try {
      const course = await this.courseRepository.find({
        where: { id },
        relations: {
          updatedBy: true,
          createdBy: true,
          category: true,
          classType: true,
          //  enrollments: true
        }
      });
      return course;
    } catch (error) {
      //console(error);
      throw error;
    }
  }

  async update(id: number, updateCourseDto: UpdateCourseDto, userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: userId
        }
      });
      if (!user) {
        throw new UnauthorizedException("Invalid User");
      }
      if (!user.roles.includes(Role.ADMIN)) {
        throw new ForbiddenException("You don't have this permission!");
      }


      const course = await this.courseRepository.findOne({
        where: {
          id
        },
        relations: {
          classType: true,
          category: true,
        }
      });
      Object.assign(course, updateCourseDto);


      if (updateCourseDto.categoryId) {
        const category = await this.categoryRepository.findOne({
          where: {
            id: updateCourseDto.categoryId
          }
        });
        if (!category) {
          throw new NotFoundException("Category not found");
        }
        course.category = category;
      }
      if (updateCourseDto.classType) {
        const classType = await this.classTypeRepository.findOne({
          where: {
            id: updateCourseDto.classType
          }
        });
        if (!classType) {
          throw new NotFoundException("Class type not found");
        }

        course.classType = classType;
      }
      return await this.courseRepository.save(course);

    } catch (error) {
      //console(error);
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }
}
