import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class ClassService {
  private readonly logger = new Logger(ClassService.name);

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

      //console(createClassDto);
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
      Object.assign(newClass, createClassDto);
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
      // Ensure price is stored as a number and isPriceIncreased is explicitly set to false
      newClass.price = typeof createClassDto.price === 'string' 
        ? parseFloat(createClassDto.price) 
        : Number(createClassDto.price);
      newClass.isPriceIncreased = false; // Explicitly set to false for newly created classes
      return await this.classRepository.save(newClass);
    } catch (error) {
      //console(error);
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
      //console(classs);
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
      //console(error);
      throw error;
    }
  }




  async findAll(filters: FilterDto, isAdmin: boolean = false) {
    try {
      //console(filters);
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
        locationName,
        countryId,
        stateId,
        status,
        isCancel,
        nearbyLocation,
        isCorpClass
      } = filters;

      // Set default startFrom to today's date if not provided in query params
      const effectiveStartFrom = startFrom || new Date().toISOString().split('T')[0];
      //console('effectiveStartFrom type:', typeof effectiveStartFrom);
      //console('effectiveStartFrom value:', effectiveStartFrom);


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
        .loadRelationCountAndMap('class.enrollmentCount', 'class.enrollments')
        .loadRelationCountAndMap('class.activeEnrollmentCount', 'class.enrollments', 'enrollment', qb => qb.where('enrollment.status = :status', { status: true }));

      // Apply search if provided
      if (search) {
        queryBuilder.andWhere(
          '(LOWER(class.title) LIKE LOWER(:search) OR LOWER(class.description) LIKE LOWER(:search))',
          { search: `%${search}%` }
        );
      }



      //console('Filters:', filters);
      //console('startFrom (query param):', startFrom);
      //console('effectiveStartFrom (with default):', effectiveStartFrom);
      //console('dateTo:', dateTo);
      //console('isCorpClass:', isCorpClass);


      // Apply date range filter with startFrom (defaults to today's date if not provided)
      const formattedStartFrom = this.formatDateWithoutTimezone(effectiveStartFrom);
      //console('formattedStartFrom:', formattedStartFrom);
      queryBuilder.andWhere('class.startDate >= :startFrom', { startFrom: formattedStartFrom });

      if (nearbyLocation) {
        const nearbyLocations = nearbyLocation.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        //console('nearbyLocations', nearbyLocations);
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
        const formattedDateTo = this.formatDateWithoutTimezone(dateTo);
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

      if (locationName) {
        const lowerLocationName = locationName.toLowerCase();
        queryBuilder.andWhere('LOWER(location.location) LIKE :locationName', {
          locationName: `%${lowerLocationName}%`
        });
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
      //console("page", page);
      //console("limit", limit);
      //console("skip", skip);
      queryBuilder.skip(skip).take(limit);

      //console(queryBuilder.getSql());

      // Execute query and get total count
      const [classes, total] = await queryBuilder.getManyAndCount();

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);
      const currentPage = page;
      const hasNext = currentPage < totalPages;
      const hasPrevious = currentPage > 1;
      //console('Classes:', classes.length);

      return {
        data: isAdmin ? classes : await this.dynamicPrice(classes),
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



  /**
   * Dynamically adjusts class prices based on proximity to start date
   * Only applies to classes that are within 14 days of start date and were created at least 24 hours ago
   * This prevents price increases for newly created classes
   * 
   * Production-ready features:
   * - Race condition protection via WHERE clause check
   * - Grace period to prevent immediate price increases after creation
   * - Proper error handling and logging
   * - Type-safe price calculations
   * 
   * @param classes - Array of classes to check for price updates
   * @returns Updated classes array
   */
  async dynamicPrice(classes: Class[]): Promise<Class[]> {
    try {
      const currentDate = new Date();
      const currentDateString = this.formatDateWithoutTimezone(currentDate);
      const currentDateTime = currentDate.getTime();

      // Grace period: 24 hours (prevent price increase for classes created within last 24 hours)
      const GRACE_PERIOD_HOURS = 24;

      // Step 1: Identify classes that need price updates in a single pass
      const classesToUpdate = classes.filter(classs => {
        // Skip if price was already increased (in-memory check)
        if (classs.isPriceIncreased) {
          return false;
        }

        // Skip if class was created within the grace period (24 hours)
        if (classs.createdAt) {
          const createdAtTime = new Date(classs.createdAt).getTime();
          const hoursSinceCreation = (currentDateTime - createdAtTime) / (1000 * 60 * 60);
          if (hoursSinceCreation < GRACE_PERIOD_HOURS) {
            return false; // Too recently created, skip price increase
          }
        }

        // Validate start date exists
        const startDateString = classs.startDate; // Already in YYYY-MM-DD format
        if (!startDateString) {
          return false; // Skip if no start date
        }

        // Calculate days until class starts
        const daysDiff = this.calculateDaysDifference(startDateString, currentDateString);
        
        // Only increase price if class starts within 14 days and hasn't started yet
        return daysDiff < 14 && daysDiff >= 0;
      });

      if (classesToUpdate.length === 0) {
        return classes; // Early return if no updates needed
      }

      const classIds = classesToUpdate.map(c => c.id);
      this.logger.log(`Applying dynamic price increase to ${classIds.length} classes: [${classIds.join(', ')}]`);

      // Step 2: Perform bulk database update with race condition protection
      // CRITICAL: WHERE clause must check isPriceIncreased to prevent concurrent updates
      // This ensures that even if multiple requests process the same class, only one will succeed
      const updateResult = await this.classRepository
        .createQueryBuilder()
        .update(Class)
        .set({
          price: () => 'price + :increment',
          isPriceIncreased: true
        })
        .where('id IN (:...ids)', { ids: classIds })
        .andWhere('isPriceIncreased = :isPriceIncreased', { isPriceIncreased: false }) // Race condition protection
        .setParameter('increment', 100)
        .execute();

      const affectedRows = updateResult.affected || 0;
      
      if (affectedRows === 0) {
        this.logger.warn('No classes were updated (likely due to concurrent updates or already increased)');
        return classes; // Return original classes if update was prevented by race condition
      }

      if (affectedRows !== classIds.length) {
        this.logger.warn(
          `Price update mismatch: expected ${classIds.length} updates, but ${affectedRows} were applied. ` +
          `Some classes may have been updated concurrently.`
        );
      }

      // Step 3: Update prices in memory for classes that were successfully updated
      // Only update classes that match the IDs we tried to update
      // Note: We can't know exactly which ones succeeded without re-querying, so we update all
      // The database is the source of truth, so slight inconsistency here is acceptable for performance
      classesToUpdate.forEach(classs => {
        // Ensure price is treated as a number, not a string
        const currentPrice = typeof classs.price === 'string' 
          ? parseFloat(classs.price) 
          : Number(classs.price);
        
        if (!isNaN(currentPrice)) {
          classs.price = currentPrice + 100;
          classs.isPriceIncreased = true;
        }
      });

      this.logger.log(`Successfully applied price increase to ${affectedRows} class(es)`);
      return classes;
    } catch (error) {
      this.logger.error('Error in dynamicPrice:', error);
      // Don't throw - return original classes to prevent breaking the API response
      // The price increase is not critical for the API to function
      return classes;
    }
  }

  /**
   * Calculates the difference in days between two date strings (YYYY-MM-DD format)
   * @param date1 - First date string in YYYY-MM-DD format
   * @param date2 - Second date string in YYYY-MM-DD format
   * @returns Difference in days (positive if date1 is later)
   */
  private calculateDaysDifference(date1: string, date2: string): number {
    const d1 = new Date(date1 + 'T00:00:00'); // Add time to ensure consistent parsing
    const d2 = new Date(date2 + 'T00:00:00');
    const timeDiff = d1.getTime() - d2.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
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
      //console(error);
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
      //console(error);
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
        console.log("updateClassDto.startDate (original):", updateClassDto.startDate);
        console.log("updateClassDto.startDate type:", typeof updateClassDto.startDate);
        const newStartDate = this.formatDateWithoutTimezone(updateClassDto.startDate);
        console.log("newStartDate (formatted):", newStartDate);
        classs.startDate = newStartDate;
      }
      if (updateClassDto.endDate) {
        console.log("updateClassDto.endDate (original):", updateClassDto.endDate);
        console.log("updateClassDto.endDate type:", typeof updateClassDto.endDate);
        const newEndDate = this.formatDateWithoutTimezone(updateClassDto.endDate);
        console.log("newEndDate (formatted):", newEndDate);
        classs.endDate = newEndDate;
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
      //console(error);
      throw error;
    }
  }
  async getAllCategory() {
    try {

      return await this.categoryRepository.find();
    } catch (error) {
      //console(error);
      throw error;
    }
  }

  async createClassType(createCategory: CreateCategoryDto) {
    try {
      const newClassType = await this.classTypeRepository.create(createCategory);
      return await this.classTypeRepository.save(newClassType);
    } catch (error) {
      //console(error);
      throw error;
    }
  }
  async getAllClassType() {
    try {

      return await this.classTypeRepository.find();
    } catch (error) {
      //console(error);
      throw error;
    }
  }

  async updateCategory(id: number, updateCategory: UpdateCategoryDto) {

    try {
      const category = await this.categoryRepository.findOne({ where: { id: id } });
      if (!category) {
        throw new NotFoundException("Category not Found");
      }
      Object.assign(category, updateCategory);
      return await this.categoryRepository.save(category);
    } catch (error) {
      //console(error);
      throw error;
    }
  }

  /**
   * Formats a date to YYYY-MM-DD format without timezone conversion
   * Handles both Date objects and date strings (including UTC strings)
   * @param date - Date object or date string
   * @returns Formatted date string in YYYY-MM-DD format
   */
  private formatDateWithoutTimezone(date: Date | string): string {
    // If it's already a string in YYYY-MM-DD format, return as is
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }

    // If it's a UTC date string like "2025-08-22T00:00:00.000Z"
    if (typeof date === 'string' && date.includes('T') && date.endsWith('Z')) {
      // Extract just the date part before the 'T' to avoid timezone conversion
      const datePart = date.split('T')[0];
      return datePart; // Already in YYYY-MM-DD format
    }

    // If it's a date string with time but no timezone (like "2025-08-22T00:00:00")
    if (typeof date === 'string' && date.includes('T') && !date.endsWith('Z')) {
      const datePart = date.split('T')[0];
      return datePart;
    }

    // For Date objects or other string formats, create a new Date and format it
    const d = new Date(date);

    // Format the date components
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    // Pad with leading zeros if needed
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }
}
