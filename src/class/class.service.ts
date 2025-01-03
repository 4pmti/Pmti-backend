import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from 'src/student/entities/student.entity';
import { DataSource, In, Repository } from 'typeorm';
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
import { CreateCategoryDto } from './dto/create-category.dto';

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
      const instructor = await this.instructorRepository.findOne({
        where: {
          id: createClassDto.instructorId
        }
      });

      if (!instructor) {
        throw new BadRequestException("Invalid Insructor");
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
      newClass.instructor = instructor;
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


  async register(userId: string, registerDto: any) {
    //TODO: Implement this method
  }




  async findAll(filters: FilterDto) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        sort = 'createdAt:DESC',
        startFrom,
        dateTo,
        classType,
        courseCategory,
        locationId,
        instructorId,
        countryId
      } = filters;

      // Create query builder
      const queryBuilder = this.classRepository.createQueryBuilder('class')
      .leftJoinAndSelect('class.classType', 'classType')
      .leftJoinAndSelect('class.category', 'category')
      .leftJoinAndSelect('class.location', 'location')
      .leftJoinAndSelect('class.instructor', 'instructor')
      .leftJoinAndSelect('class.country', 'country')
      .leftJoinAndSelect('class.addedBy', 'addedBy') // Example for addedBy user relation
      .leftJoinAndSelect('class.updatedBy', 'updatedBy'); // Example for updatedBy user relation

    // Apply search if provided

      // Apply search if provided
      if (search) {
        queryBuilder.andWhere(
          '(LOWER(class.title) LIKE LOWER(:search) OR LOWER(class.description) LIKE LOWER(:search))',
          { search: `%${search}%` }
        );
      }

      // Apply date range filter
      if (startFrom) {
        queryBuilder.andWhere('class.startDate >= :startFrom', { startFrom });
      }
      if (dateTo) {
        queryBuilder.andWhere('class.endDate <= :dateTo', { dateTo });
      }

      // Apply class type filter
      if (classType) {
        queryBuilder.andWhere('class.classtypeID = :classType', { classType });
      }

      // Apply course category filter
      if (courseCategory) {
        queryBuilder.andWhere('class.categoryID = :courseCategory', { courseCategory });
      }

      // Apply location filter
      if (locationId) {
        queryBuilder.andWhere('class.locationID = :locationId', { locationId });
      }

      // Apply instructor filter
      if (instructorId) {
        queryBuilder.andWhere('class.instructorId = :instructorId', { instructorId });
      }

      // Apply country filter
      if (countryId) {
        queryBuilder.andWhere('class.countryID = :countryId', { countryId });
      }

      // Apply sorting
      if (sort) {
        const [field, order] = sort.split(':');
        queryBuilder.orderBy(`class.${field}`, order.toUpperCase() as 'ASC' | 'DESC');
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
      const classs = await this.classRepository.findOne({
        where: {
          id: id
        }
      });
      if (!classs) {
        throw new NotFoundException("Class not Found");
      }
      return classs;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(id: number, userId: string, updateClassDto: UpdateClassDto) {
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

      const classs = await this.classRepository.findOne({
        where: {
          id: id
        }
      });
      if (!classs) {
        throw new NotFoundException("Class not Found");
      }
      Object.assign(classs, updateClassDto);


      const updatedClass = await this.classRepository.save(classs);

      return updatedClass;


    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async bulkDelete(userId: string, ids: number[]) {
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
      const classes = await this.classRepository.findBy({ id: In(ids) });
      if (classes.length !== ids.length) {
        throw new NotFoundException('Some classes were not found');
      }
      await this.classRepository.remove(classes);
    } catch (error) {
      console.error('Error in bulkDelete:', error);
      throw new Error('Failed to delete classes');
    }

  }

  async remove(id: number, userId: string) {
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
      const classs = await this.classRepository.findOne({
        where: {
          id: id
        }
      });
      if (!classs) {
        throw new NotFoundException("Class not Found");
      }
      await this.classRepository.remove(classs);
    } catch (error) {
      throw error;
    }
  }


  async createCategory(createCategory: CreateCategoryDto) {
    try {
      const newCategory = this.categoryRepository.create(createCategory);
      return await this.categoryRepository.save(newCategory);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getAllCategory() {
    try {

      return await this.categoryRepository.find();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createClassType(createCategory: CreateCategoryDto) {
    try {
      const newClassType = this.classTypeRepository.create(createCategory);
      return await this.categoryRepository.save(newClassType);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getAllClassType() {
    try {

      return await this.classTypeRepository.find();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
