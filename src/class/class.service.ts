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
import { CreateCategoryDto } from './dto/create-category.dto';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { State } from 'src/state/entities/state.entity';
import { FilterDto } from './dto/filter.dto';
import { classStatus } from 'src/common/enums/enums';
import { Course } from 'src/course/entities/course.entity';

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
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>
  ) { }


  async create(userId: string, createClassDto: CreateClassDto) {

    try {

      console.log(createClassDto);
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
          id: createClassDto.locationId
        },
        relations: {
          state: true
        }
      });
      if (!location) {
        throw new BadRequestException('Location Not Found');
      }

      const state = location.state;

      if (!state) {
        throw new NotFoundException("State not found");
      }

      const newClass = new Class();
      Object.assign(newClass, createClassDto);;
      newClass.category = classCategory;
      newClass.addedBy = user;
      // Fix: Preserve the exact date without timezone conversion
      newClass.startDate = this.formatDateWithoutTimezone(createClassDto.startDate);
      newClass.endDate = this.formatDateWithoutTimezone(createClassDto.endDate);
      newClass.instructor = instructor;
      newClass.updatedBy = user;
      newClass.classType = classType;
      newClass.location = location;
      newClass.country = country;
      newClass.state = state;
      newClass.status = classStatus.ACTIVE;
      return await this.classRepository.save(newClass);
    } catch (error) {
      console.log(error);
      throw error;
    }

  }


  async findClassDetails(classId: number) {
    try {
      //class 
      const classs = await this.classRepository.findOne({
        where: {
          id: classId
        },
        relations: {
          instructor: true,
          location: true,
          country: true,
          classType: true,
          category: true,
          state: true
        }
      });
      if (!classs) {
        throw new NotFoundException("Class not Found");
      }
      console.log(classs);
      const enrollments = await this.enrollmentRepository.find({
        where: {
          class: { id: classs.id },
        },
        relations: {
          student: true,
        },
        select: {
          // Select all other fields except credit card details
          enrollmentType: true,
          EnrollmentDate: true,
          Comments: true,
          BillingName: true,
          BillingAddress: true,
          BillingCity: true,
          BillingState: true,
          BillCountry: true,
          BillPhone: true,
          BillMail: true,
          BillDate: true,
          isDelete: true,
          status: true,
          enrollmentProgress: true,
          PMPPass: true,
          CourseExpiryDate: true,
          MealType: true,
          Price: true,
          Discount: true,
          PaymentMode: true,
          ID: true,
          POID: true,
          TransactionId: true,
          pmbok: true,
          // Exclude fields like CCNo, CCExpiry, CreditCardHolder, etc.
        }
      });


      const data = {
        classs,
        enrollments,
      }

      return data;


    } catch (error) {
      console.log(error);
      throw error;
    }
  }




  async findAll(filters: FilterDto) {
    try {
      console.log(filters);
      const {
        page = 1,
        limit = 10,
        search = '',
        sort = 'startDate:ASC',
        startFrom,
        dateTo,
        classType,
        courseCategory,
        locationId,
        instructorId,
        countryId,
        stateId,
        status,
        isCancel,
        nearbyLocation,
        isCorpClass
      } = filters;


      // Create query builder
      const queryBuilder = this.classRepository.createQueryBuilder('class')
        .leftJoinAndSelect('class.classType', 'classType')
        .leftJoinAndSelect('class.category', 'category')
        .leftJoinAndSelect('class.location', 'location')
        .leftJoinAndSelect('class.instructor', 'instructor')
        .leftJoinAndSelect('class.country', 'country')
        .leftJoinAndSelect('class.addedBy', 'addedBy')
        .leftJoinAndSelect('class.updatedBy', 'updatedBy')
        .leftJoinAndSelect('class.state', 'state')
        .loadRelationCountAndMap('class.enrollmentCount', 'class.enrollments');

      // Apply search if provided
      if (search) {
        queryBuilder.andWhere(
          '(LOWER(class.title) LIKE LOWER(:search) OR LOWER(class.description) LIKE LOWER(:search))',
          { search: `%${search}%` }
        );
      }



      console.log('Filters:', filters);
      console.log('startFrom:', startFrom);
      console.log('dateTo:', dateTo);
      console.log('isCorpClass:', isCorpClass);


      // Apply date range filter only if startFrom is explicitly provided
      if (startFrom !== undefined && startFrom !== null) {
        const formattedStartFrom = this.formatDateWithoutTimezone(new Date(startFrom));
        queryBuilder.andWhere('class.startDate >= :startFrom', { startFrom: formattedStartFrom });

      }

      if (nearbyLocation) {
        const nearbyLocations = nearbyLocation.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        console.log('nearbyLocations', nearbyLocations);
        if (nearbyLocations.length > 0) {
          queryBuilder.andWhere('class.locationID IN (:...nearbyLocations)', { nearbyLocations });
        }
      }

      if (isCancel) {
        queryBuilder.andWhere('class.isCancel = :isCancel', { isCancel });
      }

      // Only apply isCorpClass filter if it's explicitly provided
      if (isCorpClass !== undefined && isCorpClass !== null) {
        queryBuilder.andWhere('class.isCorpClass = :isCorpClass', { isCorpClass });
      }

      if (status) {
        queryBuilder.andWhere('class.status = :status', { status });
      }

      if (dateTo) {
        const formattedDateTo = this.formatDateWithoutTimezone(new Date(dateTo));
        queryBuilder.andWhere('class.endDate <= :dateTo', { dateTo: formattedDateTo });
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

      if (stateId) {
        queryBuilder.andWhere('class.stateId = :stateId', { stateId });
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
      console.log("page", page);
      console.log("limit", limit);
      console.log("skip", skip);
      queryBuilder.skip(skip).take(limit);

      console.log(queryBuilder.getSql());

      // Execute query and get total count
      const [classes, total] = await queryBuilder.getManyAndCount();

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);
      const currentPage = page;
      const hasNext = currentPage < totalPages;
      const hasPrevious = currentPage > 1;
      console.log('Classes:', classes.length);

      return {
        data: await this.dynamicPrice(classes),
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



  async dynamicPrice(classes: Class[]) {
    try {
      const currentDate = new Date();

      // Step 1: Identify classes that need price updates in a single pass
      const classesToUpdate = classes.filter(classs => {
        const startDate = new Date(classs.startDate);
        const daysDiff = (startDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24);
        return daysDiff < 14 && daysDiff >= 0 && !classs.isPriceIncreased;
      });

      if (classesToUpdate.length === 0) {
        return classes; // Early return if no updates needed
      }

      // Step 2: Perform bulk database update
      await this.classRepository
        .createQueryBuilder()
        .update(Class)
        .set({
          price: () => 'price + :increment',
          isPriceIncreased: true
        })
        .where('id IN (:...ids)', {
          ids: classesToUpdate.map(c => c.id),
          increment: 100
        })
        .execute();

      // Step 3: Update prices in memory
      classesToUpdate.forEach(classs => {
        classs.price = Number(classs.price) + 100;
        classs.isPriceIncreased = true;
      });

      return classes;
    } catch (error) {
      console.error('Error in dynamicPrice:', error);
      throw error;
    }
  }


  async changePrice(classId: number, price: number) {
    try {
      const classs = await this.classRepository.findOne({
        where: {
          id: classId
        }
      });
      if (!classs) {
        throw new NotFoundException("Class not Found");
      }
      classs.price = price;
      return await this.classRepository.save(classs);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }


  async findOne(id: number) {
    try {
      const classs = await this.classRepository.findOne({
        where: {
          id: id
        },
        relations: {
          instructor: true,
          location: true,
          country: true,
          classType: true,
          category: true
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
      if (!user.roles.includes(Role.ADMIN)) {
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
      
      // Fix: Handle date conversion for updates if dates are provided
      if (updateClassDto.startDate) {
        classs.startDate = this.formatDateWithoutTimezone(updateClassDto.startDate);
      }
      if (updateClassDto.endDate) {
        classs.endDate = this.formatDateWithoutTimezone(updateClassDto.endDate);
      }

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
      if (!user.roles.includes(Role.ADMIN)) {
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
      if (!user.roles.includes(Role.ADMIN)) {
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
      const newClassType = await this.classTypeRepository.create(createCategory);
      return await this.classTypeRepository.save(newClassType);
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

  private formatDateWithoutTimezone(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
  }
}
