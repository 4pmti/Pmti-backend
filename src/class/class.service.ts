import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from 'src/student/entities/student.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { ClassType } from './entities/classtype.entity';
import { Category } from './entities/category.entity';
import { Location } from 'src/location/entities/location.entity';
import { Instructor } from 'src/instructor/entities/instructor.entity';
import { Country } from 'src/country/entities/country.entity';
import { Role } from 'src/common/enums/role';
import { Class } from './entities/class.entity';
import { FilterDto } from './dto/filter.dto';

@Injectable()
export class ClassService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(ClassType)
    private readonly classTypeRepository: Repository<ClassType>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) { }


  async create(userId: string, createClassDto: CreateClassDto) {

    try {
      const user = await this.userRepository.findOne({
        where: {
          id: userId
        }
      });
      if (!user) {
        throw new UnauthorizedException("Invalid User");
      }
      if (user.role != Role.ADMIN) {
        throw new ForbiddenException("You don't have this permission!");
      }

      const classType = await this.classTypeRepository.findOne({
        where: {
          id: createClassDto.classTypeId
        }
      });
      if (!classType) {
        throw new BadRequestException("Invalid class type");
      }
      const classCategory = await this.categoryRepository.findOne({
        where: {
          id: createClassDto.categoryId
        }
      });
      if (!classCategory) {
        throw new BadRequestException("Invalid class category");
      }

      const country = await this.countryRepository.findOne({
        where: {
          id: createClassDto.countryId
        }
      });
      if (!country) {
        throw new BadRequestException('Country Not Found');
      }

      const location = await this.locationRepository.findOne({
        where: {
          id: createClassDto.countryId
        }
      });
      if (!location) {
        throw new BadRequestException('Location Not Found');
      }
      const newClass = new Class();
      Object.assign(newClass, createClassDto);;
      newClass.category = classCategory;
      newClass.addedBy = user;
      newClass.updatedBy = user;
      newClass.classType = classType;
      newClass.location = location;
      newClass.country = country;
      return await this.classRepository.save(newClass);
    } catch (error) {
      console.log(error);
      throw error;
    }

  }

  async findAll(filters:FilterDto) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        sort = 'createdAt:DESC'
      } = filters;

      // Create query builder
      const queryBuilder = this.classRepository.createQueryBuilder('class');

      // Apply search if provided
      if (search) {
        queryBuilder.where(
          'class.name ILIKE :search OR class.description ILIKE :search',
          { search: `%${search}%` }
        );
      }

      // Apply sorting
      if (sort) {
        const [field, order] = sort.split(':');
        queryBuilder.orderBy(`class.${field}`, order as 'ASC' | 'DESC');
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

  findOne(id: number) {
    return `This action returns a #${id} class`;
  }

  update(id: number, updateClassDto: UpdateClassDto) {
    return `This action updates a #${id} class`;
  }

  remove(id: number) {
    return `This action removes a #${id} class`;
  }
}
