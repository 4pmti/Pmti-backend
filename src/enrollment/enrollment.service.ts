import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { BulkUpdateEnrollmentDto, UpdateEnrollmentDto } from './dto/update-enrollment.dto';
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
import { EmailService } from 'src/common/services/email.service';
import { RescheduleDto } from './dto/reschedule.dto';
import { isAdmin } from 'src/common/util/utilities';
import { OfflineClassEnrollmentDto } from './dto/class-offline-enrollment.dto';
import { Role } from 'src/common/enums/role';
import { OfflineCourseEnrollmentDto } from './dto/course-offline-enrollment.dto';
import { State } from 'src/state/entities/state.entity';
import { Country } from 'src/country/entities/country.entity';
import { Location } from 'src/location/entities/location.entity';
import { EmailQueueService } from 'src/queue/emails/queue.service';
import { EmailJobType, PortalLoginData, RescheduleEmailData, StudentRegistrationData } from 'src/common/templates/types';
@Injectable()
export class EnrollmentService {
  private readonly logger = new Logger(EnrollmentService.name);

  constructor(
    private readonly dataSource: DataSource,
    private authorizeNetService: AuthorizeNetService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
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
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    @InjectRepository(State)
    private stateRepository: Repository<State>,
    @InjectRepository(Country)
    private countryRepository: Repository<Country>,


    private queueService: EmailQueueService,
  ) { }

  private maskCardNumber(cardNumber: string): string {
    return cardNumber.replace(/\d(?=\d{4})/g, 'X'); // Masks all but the last 4 digits
  }

  private generateRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const passwordLength = 12;
    let password = '';
    for (let i = 0; i < passwordLength; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}



  async rescheduleClass(userId: string, rescheduleDto: RescheduleDto) {
    this.logger.log(`Starting reschedule class process for user: ${userId}, enrollment: ${rescheduleDto.enrollmentId}, class: ${rescheduleDto.classId}`);
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    this.logger.log('Database transaction started for reschedule operation');
    
    try {
      // Validate admin permissions
      this.logger.log(`Validating admin permissions for user: ${userId}`);
      if (!await isAdmin(userId, this.userRepository)) {
        this.logger.warn(`Unauthorized reschedule attempt by user: ${userId}`);
        throw new UnauthorizedException("You dont have permission to perform this action!!!");
      }
      this.logger.log(`Admin permissions validated for user: ${userId}`);
      
      // Fetch the admin user details
      this.logger.log(`Fetching admin user details for user: ${userId}`);
      const user = await queryRunner.manager.findOne(User, {
        where: {
          id: userId
        }
      });
      this.logger.log(`Admin user found: ${user?.name || 'Unknown'} (ID: ${userId})`);

      // Fetch the student details
      this.logger.log(`Fetching student details for student ID: ${rescheduleDto.studentId}`);
      const student = await queryRunner.manager.findOne(Student, {
        where: {
          id: rescheduleDto.studentId
        }
      });
      
      if (!student) {
        this.logger.error(`Student not found with ID: ${rescheduleDto.studentId}`);
        throw new NotFoundException('Student not found');
      }
      this.logger.log(`Student found: ${student.name} (ID: ${student.id}, Email: ${student.email})`);

      // Fetch the class details
      this.logger.log(`Fetching class details for class ID: ${rescheduleDto.classId}`);
      const classs = await queryRunner.manager.findOne(Class, {
        where: {
          id: rescheduleDto.classId
        },
        relations: {
          location: true
        }
      });

      if (!classs) {
        this.logger.error(`Class not found with ID: ${rescheduleDto.classId}`);
        throw new NotFoundException('Class not found');
      }
      this.logger.log(`Class found: ${classs.title || 'Untitled'} (ID: ${classs.id}, Location: ${classs.location?.location || 'Unknown'}, Start: ${classs.startDate}, End: ${classs.endDate})`);

      // Fetch the enrollment details
      this.logger.log(`Fetching enrollment details for enrollment ID: ${rescheduleDto.enrollmentId}, student ID: ${student.id}`);
      let enrollment = await queryRunner.manager.findOne(Enrollment, {
        where: {
          ID: rescheduleDto.enrollmentId,
          student: {
            id: student.id
          },
        },
        relations: {
          student: true,
          class: true
        }
      });
      
      if (!enrollment) {
        this.logger.error(`Enrollment not found with ID: ${rescheduleDto.enrollmentId} for student: ${student.id}`);
        throw new NotFoundException('Enrollment not found');
      }
      this.logger.log(`Enrollment found: ID ${enrollment.ID}, Student: ${enrollment.student?.name || 'Unknown'}, Current Class: ${enrollment.class?.title || 'Unknown'}`);

      if (rescheduleDto.isPaid) {
        this.logger.log(`Processing payment for reschedule. Amount: ${rescheduleDto.amount}, Student: ${student.name}`);
        this.logger.log(`Credit card details - Last 4 digits: ${rescheduleDto.ccNo.slice(-4)}, Expiry: ${rescheduleDto.CCExpiry}`);
        
        const result = await this.authorizeNetService.chargeCreditCard(
          rescheduleDto.amount,
          rescheduleDto.ccNo,
          rescheduleDto.CCExpiry,
          rescheduleDto.CVV,
          student.email,
          '', ''
        );
        
        this.logger.log(`Payment processed successfully. Transaction result: ${JSON.stringify(result)}`);
        
        await queryRunner.manager.update(Enrollment, enrollment.ID, {
          class: classs,
          Comments: enrollment.Comments + `\nreschedule paid amount ${rescheduleDto.amount} on ${new Date().toISOString()}`
        });
        this.logger.log(`Enrollment updated with payment information for enrollment ID: ${enrollment.ID}`);
      } else {
        this.logger.log(`No payment required for this reschedule operation`);
      }

      // Move the enrollment to the new class
      this.logger.log(`Updating enrollment ${enrollment.ID} to new class ${classs.id} (${classs.title})`);
      await queryRunner.manager.update(Enrollment, enrollment.ID, {
        class: classs,
        Comments: enrollment.Comments + `\nreschedule class on ${new Date().toISOString()}`
      });
      
      const updatedEnrollment = await queryRunner.manager.findOne(Enrollment, {
        where: {
          ID: enrollment.ID
        }
      });
      this.logger.log(`Enrollment successfully updated to new class. Updated enrollment ID: ${updatedEnrollment?.ID}`);

      // Prepare email notification data
      this.logger.log(`Preparing email notification data for reschedule confirmation`);
      const rescheduleEmailData: RescheduleEmailData = {
        adminName: user.name,
        studentName: student.name,
        studentId: student.id.toString(),
        studentEmail: student.email,
        oldLocation: classs.location.location,
        oldStartDate: classs.startDate,
        oldEndDate: classs.endDate,
        newLocation: classs.location.location,
        newStartDate: classs.startDate,
        newEndDate: classs.endDate,
        address: student.address,
      }

      this.logger.log(`Email data prepared - Admin: ${user.name}, Student: ${student.name}, Location: ${classs.location.location}, Dates: ${classs.startDate} to ${classs.endDate}`);

      // Add email job to queue
      this.logger.log(`Adding email notification job to queue for recipients: ${student.email}, ${process.env.ADMIN_EMAIL}`);
      await this.queueService.addJob({
        type: EmailJobType.RESCHEDULE_CONFIRMATION,
        data: rescheduleEmailData,
        recipients: [student.email, process.env.ADMIN_EMAIL]
      });
      this.logger.log(`Email notification job successfully added to queue`);

      // Commit transaction
      this.logger.log(`Committing database transaction for reschedule operation`);
      await queryRunner.commitTransaction();
      this.logger.log(`Reschedule class operation completed successfully for enrollment: ${enrollment.ID}`);
      
      return updatedEnrollment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
      
      this.logger.error(`Error during reschedule class operation: ${errorMessage}`, errorStack);
      this.logger.error(`Rolling back database transaction due to error`);
      await queryRunner.rollbackTransaction();
      this.logger.error(`Database transaction rolled back successfully`);
      throw error;
    } finally {
      this.logger.log(`Releasing database query runner`);
      await queryRunner.release();
      this.logger.log(`Database query runner released`);
    }
  }

  async createOfflineClassEnrollment(userId: string, offlineEnrollment: OfflineClassEnrollmentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    //console(offlineEnrollment);
    try {
      const user = await queryRunner.manager.findOne(User, {
        where: {
          id: userId,
        }
      });
      if (!user.roles.includes(Role.ADMIN)) {
        throw new UnauthorizedException("You are not authorized to perform this action!");
      }

      const classs = await queryRunner.manager.findOne(Class, {
        where: {
          id: offlineEnrollment.classId,
        },
        relations: {
          category: true,
          location: true,
          country: true
        }
      });
      if (!classs) {
        throw new NotFoundException("Class not found");
      }
      const student = await queryRunner.manager.findOne(Student, {
        where: {
          id: offlineEnrollment.studentId
        }
      });
      if (!student) {
        throw new NotFoundException("User not found");
      }

      //TODO: check if the student has already enrolled in the class

      // const pastEnrollment = await queryRunner.manager.findOne(Enrollment, {
      //   where: {
      //     POID: offlineEnrollment.purchaseOrderId
      //   }
      // });

      // if (!pastEnrollment) {
      //   throw new NotFoundException("Enrollment not found");
      // }

      let initialAmount = offlineEnrollment.amount;
      const currentDate = new Date();
      if (offlineEnrollment.Promotion) {
        const promotion = await queryRunner.manager.findOne(Promotions, {
          where: {
            promotionId: offlineEnrollment.Promotion
          },
          relations: {
            category: true,
            country: true
          }
        });
        if (!promotion) {
          throw new NotFoundException("Promotion is not valid");
        }

        if (promotion.startDate && promotion.endDate) {
          if (currentDate < new Date(promotion.startDate) || currentDate > new Date(promotion.endDate)) {
            throw new BadRequestException("Promotion is not active");
          }
        }

        if (classs.category.id != promotion.category.id) {
          throw new BadRequestException("This promotion is not valid for this class.");
        }
        //console(initialAmount, promotion.amount);
        initialAmount -= promotion.amount;
        if (initialAmount < 0) {
          initialAmount = 0;
        }
      }

      let result: any = null;
      if (offlineEnrollment.isPaid) {
        // Only process payment if isPaid is true
        if (initialAmount > 0) {
          // Validate payment-related fields when payment is required
          const paymentFields = {
            'Credit Card Number': offlineEnrollment.CCNo,
            'Credit Card Expiry': offlineEnrollment.CCExpiry,
            'Credit Card CVV': offlineEnrollment.CVV,
            'Credit Card Holder': offlineEnrollment.CreditCardHolder,
            'Billing Email': offlineEnrollment.BillMail
          };

          const missingPaymentFields = Object.entries(paymentFields)
            .filter(([_, value]) => !value || value.toString().trim() === '')
            .map(([key]) => key);

          if (missingPaymentFields.length > 0) {
            throw new BadRequestException(`Missing required payment fields: ${missingPaymentFields.join(', ')}`);
          }

          result = await this.authorizeNetService.chargeCreditCard(
            initialAmount,
            offlineEnrollment.CCNo,
            offlineEnrollment.CCExpiry,
            offlineEnrollment.CVV,
            offlineEnrollment.BillMail,
            '', ''
          );
        }
      }

      const billingCountry = await queryRunner.manager.findOne(Country, {
        where: {
          id: offlineEnrollment.BillCountry
        }
      });
      if (!billingCountry) {
        throw new NotFoundException("Billing country not found");
      }

      const billingState = await queryRunner.manager.findOne(State, {
        where: {
          id: offlineEnrollment.BillingState
        }
      });
      if (!billingState) {
        throw new NotFoundException("Billing state not found");
      }

      const enrollment = new Enrollment();
      enrollment.student = student;
      enrollment.course = null;
      enrollment.class = classs;
      enrollment.Comments = offlineEnrollment.Comments;
      enrollment.BillCountry = billingCountry.CountryName;
      enrollment.BillingCity = offlineEnrollment.zipCode;
      enrollment.BillingName = offlineEnrollment.BillingName;
      enrollment.BillingState = billingState.name;
      enrollment.BillingAddress = offlineEnrollment.BillingAddress;
      enrollment.BillingCity = offlineEnrollment.BillingCity;
      enrollment.BillDate = new Date();
      enrollment.BillMail = offlineEnrollment.BillMail;
      enrollment.CCNo = offlineEnrollment.isPaid ? this.maskCardNumber(offlineEnrollment.CCNo) : null;
      enrollment.CCExpiry = offlineEnrollment.isPaid ? offlineEnrollment.CCExpiry : null;
      enrollment.Comments = offlineEnrollment.Comments;
      enrollment.MealType = offlineEnrollment.MealType;
      enrollment.PaymentMode = offlineEnrollment.isPaid ? offlineEnrollment.cardType : 'Pending-No-Payment';
      enrollment.Price = initialAmount;
      enrollment.TransactionId = result?.transId ?? null;
      enrollment.BillPhone = offlineEnrollment.BillPhone;
      enrollment.BillDate = new Date();
      enrollment.enrollmentType = "Class";
      enrollment.PMPPass = false;
      enrollment.CreditCardHolder = offlineEnrollment.isPaid ? offlineEnrollment.CreditCardHolder : null;
      enrollment.pmbok = false;
      enrollment.POID = offlineEnrollment.purchaseOrderId;
      enrollment.Discount = offlineEnrollment.amount - initialAmount <= 0 ? 0 : offlineEnrollment.amount - initialAmount;


      await queryRunner.manager.save(enrollment);
      await queryRunner.commitTransaction();
      return enrollment;
    } catch (error) {
      //console(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createOfflineCourseEnrollment(userId: string, offlineEnrollment: OfflineCourseEnrollmentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    //console(offlineEnrollment);
    try {
      const user = await queryRunner.manager.findOne(User, {
        where: {
          id: userId,
        }
      });
      if (!user.roles.includes(Role.ADMIN)) {
        throw new UnauthorizedException("You are not authorized to perform this action!");
      }

      const course = await queryRunner.manager.findOne(Course, {
        where: {
          id: offlineEnrollment.courseId,
        },
        relations: {
          category: true,
        }
      });
      if (!course) {
        throw new NotFoundException("Course not found");
      }
      const student = await queryRunner.manager.findOne(Student, {
        where: {
          id: offlineEnrollment.studentId
        }
      });
      if (!student) {
        throw new NotFoundException("User not found");
      }

      let initialAmount = offlineEnrollment.amount;
      const currentDate = new Date();
      if (offlineEnrollment.Promotion) {
        const promotion = await queryRunner.manager.findOne(Promotions, {
          where: {
            promotionId: offlineEnrollment.Promotion
          },
          relations: {
            category: true,
            country: true
          }
        });
        if (!promotion) {
          throw new NotFoundException("Promotion is not valid");
        }

        if (promotion.startDate && promotion.endDate) {
          if (currentDate < new Date(promotion.startDate) || currentDate > new Date(promotion.endDate)) {
            throw new BadRequestException("Promotion is not active");
          }
        }

        if (course.category.id != promotion.category.id) {
          throw new BadRequestException("This promotion is not valid for this course.");
        }
        //console(initialAmount, promotion.amount);
        initialAmount -= promotion.amount;
        if (initialAmount < 0) {
          initialAmount = 0;
        }
      }

      let result: any = null;
      if (offlineEnrollment.isPaid) {
        // Only process payment if isPaid is true
        if (initialAmount > 0) {
          // Validate payment-related fields when payment is required
          const paymentFields = {
            'Credit Card Number': offlineEnrollment.CCNo,
            'Credit Card Expiry': offlineEnrollment.CCExpiry,
            'Credit Card CVV': offlineEnrollment.CVV,
            'Credit Card Holder': offlineEnrollment.CreditCardHolder,
            'Billing Email': offlineEnrollment.BillMail
          };

          const missingPaymentFields = Object.entries(paymentFields)
            .filter(([_, value]) => !value || value.toString().trim() === '')
            .map(([key]) => key);

          if (missingPaymentFields.length > 0) {
            throw new BadRequestException(`Missing required payment fields: ${missingPaymentFields.join(', ')}`);
          }

          result = await this.authorizeNetService.chargeCreditCard(
            initialAmount,
            offlineEnrollment.CCNo,
            offlineEnrollment.CCExpiry,
            offlineEnrollment.CVV,
            offlineEnrollment.BillMail,
            '', ''
          );
        }
      }
      const billingCountry = await queryRunner.manager.findOne(Country, {
        where: {
          id: offlineEnrollment.BillCountry
        }
      });
      if (!billingCountry) {
        throw new NotFoundException("Billing country not found");
      }

      const billingState = await queryRunner.manager.findOne(State, {
        where: {
          id: offlineEnrollment.BillingState
        }
      });
      if (!billingState) {
        throw new NotFoundException("Billing state not found");
      }



      const enrollment = new Enrollment();
      enrollment.student = student;
      enrollment.course = course;
      enrollment.class = null;
      enrollment.Comments = offlineEnrollment.Comments;
      enrollment.BillCountry = billingCountry.CountryName;
      enrollment.BillingCity = offlineEnrollment.zipCode;
      enrollment.BillingName = offlineEnrollment.BillingName;
      enrollment.BillingState = billingState.name;
      enrollment.BillingAddress = offlineEnrollment.BillingAddress;
      enrollment.BillingCity = offlineEnrollment.BillingCity;
      enrollment.BillingState = billingState.name;
      enrollment.BillDate = new Date();
      enrollment.BillMail = offlineEnrollment.BillMail;
      enrollment.CCNo = offlineEnrollment.isPaid ? this.maskCardNumber(offlineEnrollment.CCNo) : null;
      enrollment.CCExpiry = offlineEnrollment.isPaid ? offlineEnrollment.CCExpiry : null;
      enrollment.Comments = offlineEnrollment.Comments;
      enrollment.MealType = offlineEnrollment.MealType;
      enrollment.PaymentMode = offlineEnrollment.isPaid ? offlineEnrollment.cardType : 'Pending-No-Payment';
      enrollment.Price = initialAmount;
      enrollment.TransactionId = result?.transId ?? null;
      enrollment.BillPhone = offlineEnrollment.BillPhone;
      enrollment.BillDate = new Date();
      enrollment.enrollmentType = "Course";
      enrollment.PMPPass = false;
      enrollment.CreditCardHolder = offlineEnrollment.isPaid ? offlineEnrollment.CreditCardHolder : null;
      enrollment.pmbok = false;
      enrollment.POID = offlineEnrollment.purchaseOrderId;
      enrollment.Discount = offlineEnrollment.amount - initialAmount <= 0 ? 0 : offlineEnrollment.amount - initialAmount;

      await queryRunner.manager.save(enrollment);
      await queryRunner.commitTransaction();
      return enrollment;
    } catch (error) {
      console.log("error in create offline course enrollment", error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException("Error in create offline course enrollment, " + error);
    } finally {
      await queryRunner.release();
    }
  }


  async create(createEnrollmentDto: CreateEnrollmentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    this.logger.log(`Starting enrollment creation process for email: ${createEnrollmentDto.email}`, {
      method: 'create',
      email: createEnrollmentDto.email,
      classId: createEnrollmentDto.classId,
      courseId: createEnrollmentDto.courseId
    });
    
    try {
      //validate the class and course
      if (createEnrollmentDto.classId && createEnrollmentDto.courseId) {
        this.logger.warn(`Invalid enrollment request: both classId and courseId provided`, {
          email: createEnrollmentDto.email,
          classId: createEnrollmentDto.classId,
          courseId: createEnrollmentDto.courseId
        });
        throw new NotFoundException("Either Class or Course is required");
      }



      // find user by email and check if hes already enrolled in this class or course
      this.logger.log(`Checking existing user enrollment for email: ${createEnrollmentDto.email}`);
      
      const user = await queryRunner.manager.findOne(User, {
        where: {
          email: createEnrollmentDto.email
        },
        relations: {
          student: true
        }
      });

      if (user) {
        this.logger.log(`Existing user found, checking current enrollments`, {
          userId: user.id,
          studentId: user.student?.id
        });
        
        const enrollment = await queryRunner.manager.find(Enrollment, {
          where: {
            student: user.student,
          }
        });
        
        if (enrollment.length > 0) {
          this.logger.warn(`User already enrolled in existing class/course`, {
            email: createEnrollmentDto.email,
            existingEnrollments: enrollment.length,
            userId: user.id
          });
          throw new BadRequestException("You are already enrolled in this class or course");
        }
        
        this.logger.log(`User validation passed - no existing enrollments found`);
      } else {
        this.logger.log(`New user - will create student account during enrollment`);
      }

      let enrollmentTarget: Class | Course;
      if (createEnrollmentDto.courseId) {
        this.logger.log(`Validating course enrollment target`, { courseId: createEnrollmentDto.courseId });
        
        enrollmentTarget = await queryRunner.manager.findOne(Course, {
          where: {
            id: createEnrollmentDto.courseId
          },
          relations: {
            category: true
          }
        });
        
        if (!enrollmentTarget) {
          this.logger.error(`Course not found`, { courseId: createEnrollmentDto.courseId });
          throw new NotFoundException("Course not found");
        }
        
        this.logger.log(`Course validation successful`, {
          courseId: createEnrollmentDto.courseId,
          courseName: enrollmentTarget.courseName,
          price: enrollmentTarget.price,
          category: enrollmentTarget.category?.name
        });
      } else if (createEnrollmentDto.classId) {
        this.logger.log(`Validating class enrollment target`, { courseId: createEnrollmentDto.classId });

        enrollmentTarget = await queryRunner.manager.findOne(Class, {
          where: {
            id: createEnrollmentDto.classId,
          },
          relations: {
            category: true,
            location: true,
            country: true
          }
        });
        
        if (!enrollmentTarget) {
          this.logger.error(`Class not found`, { courseId: createEnrollmentDto.classId });
          throw new NotFoundException("Class not found");
        }
        
        this.logger.log(`Class validation successful`, {
          classId: createEnrollmentDto.classId,
          title: enrollmentTarget.title,
          price: enrollmentTarget.price,
          category: enrollmentTarget.category?.name,
          location: enrollmentTarget.location?.location,
          country: enrollmentTarget.country?.CountryName
        });
      }

      //validate the student
      this.logger.log(`Validating student account for email: ${createEnrollmentDto.email}`);
      
      let student = await queryRunner.manager.findOne(Student, {
        where: {
          email: createEnrollmentDto.email
        }
      });

      const password = this.generateRandomPassword();
      if (!student) {
        this.logger.log(`Creating new student account`, {
          email: createEnrollmentDto.email,
          name: createEnrollmentDto.name
        });
        
        try {
          student = await this.userService.createStudent({
            name: createEnrollmentDto.name,
            email: createEnrollmentDto.email,
            address: createEnrollmentDto.address,
            zipCode: createEnrollmentDto.zipCode,
            city: createEnrollmentDto.city as string,
            phone: createEnrollmentDto.phone,
            state: createEnrollmentDto.state,
            password: password,
            country: createEnrollmentDto.country,
            profession: createEnrollmentDto.profession || null,
            companyName: createEnrollmentDto.companyName || null,
            referredBy: '',
          });
          
          this.logger.log(`Student account created successfully`, {
            studentId: student.id,
            email: student.email
          });
        } catch (error) {
          this.logger.error(`Failed to create student account`, {
            error: error instanceof Error ? error.message : String(error),
            email: createEnrollmentDto.email,
            stack: error instanceof Error ? error.stack : undefined
          });
          throw new InternalServerErrorException("Error in create enrollment, " + error);
        }
      } else {
        this.logger.log(`Existing student account found`, {
          studentId: student.id,
          email: student.email
        });
      }

      //check for the promotions here and validate them
      let initialAmount = enrollmentTarget.price;
      const currentDate = new Date();
      
      this.logger.log(`Starting promotion validation`, {
        originalPrice: enrollmentTarget.price,
        promotionCode: createEnrollmentDto.Promotion,
        currentDate: currentDate.toISOString()
      });
      
      if (createEnrollmentDto.Promotion) {
        this.logger.log(`Validating promotion code: ${createEnrollmentDto.Promotion}`);
        
        const promotion = await queryRunner.manager.findOne(Promotions, {
          where: {
            promotionId: createEnrollmentDto.Promotion
          },
          relations: {
            category: true,
            country: true
          }
        });

        if (!promotion) {
          this.logger.warn(`Invalid promotion code provided`, {
            promotionCode: createEnrollmentDto.Promotion,
            email: createEnrollmentDto.email
          });
          throw new NotFoundException("Promotion is not valid");
        }
        
        this.logger.log(`Promotion found, validating eligibility`, {
          promotionId: promotion.promotionId,
          amount: promotion.amount,
          category: promotion.category?.name,
          country: promotion.country?.CountryName
        });

        //time range validation check
        if (promotion.startDate && promotion.endDate) {
          this.logger.log(`Validating promotion date range`, {
            startDate: promotion.startDate,
            endDate: promotion.endDate,
            currentDate: currentDate.toISOString()
          });
          
          if (currentDate < new Date(promotion.startDate) || currentDate > new Date(promotion.endDate)) {
            this.logger.warn(`Promotion date validation failed`, {
              promotionCode: createEnrollmentDto.Promotion,
              startDate: promotion.startDate,
              endDate: promotion.endDate,
              currentDate: currentDate.toISOString()
            });
            throw new BadRequestException("Promotion is not active");
          }
          
          this.logger.log(`Promotion date validation passed`);
        }

        //class & country belonging check
        if (enrollmentTarget instanceof Class) {
          this.logger.log(`Validating promotion for class enrollment`, {
            classCategory: enrollmentTarget.category?.name,
            promotionCategory: promotion.category?.name,
            classCountry: enrollmentTarget.country?.CountryName,
            promotionCountry: promotion.country?.CountryName
          });
          
          if (enrollmentTarget.category.id != promotion.category.id) {
            this.logger.warn(`Promotion category mismatch for class`, {
              promotionCode: createEnrollmentDto.Promotion,
              classCategory: enrollmentTarget.category?.name,
              promotionCategory: promotion.category?.name
            });
            throw new BadRequestException("This promotion is not valid for this class.");
          }

          if (enrollmentTarget.country.id != promotion.country.id) {
            this.logger.warn(`Promotion country mismatch for class`, {
              promotionCode: createEnrollmentDto.Promotion,
              classCountry: enrollmentTarget.country?.CountryName,
              promotionCountry: promotion.country?.CountryName
            });
            throw new BadRequestException("This promotion is not valid for this location.");
          }
          
          initialAmount -= promotion.amount;
          if (initialAmount < 0) {
            initialAmount = 0;
          }
          
          this.logger.log(`Promotion applied successfully for class`, {
            originalPrice: enrollmentTarget.price,
            discountAmount: promotion.amount,
            finalPrice: initialAmount
          });
        }
        
        if (enrollmentTarget instanceof Course) {
          this.logger.log(`Validating promotion for course enrollment`, {
            courseCategory: enrollmentTarget.category?.name,
            promotionCategory: promotion.category?.name
          });
          
          if (enrollmentTarget.category.id != promotion.category.id) {
            this.logger.warn(`Promotion category mismatch for course`, {
              promotionCode: createEnrollmentDto.Promotion,
              courseCategory: enrollmentTarget.category?.name,
              promotionCategory: promotion.category?.name
            });
            throw new BadRequestException("This promotion is not valid for this course.");
          }
          
          initialAmount -= promotion.amount;
          if (initialAmount < 0) {
            initialAmount = 0;
          }
          
          this.logger.log(`Promotion applied successfully for course`, {
            originalPrice: enrollmentTarget.price,
            discountAmount: promotion.amount,
            finalPrice: initialAmount
          });
        }
      } else {
        this.logger.log(`No promotion code provided, using original price: ${initialAmount}`);
      }

      // search for billing country ,state and city
      this.logger.log(`Validating billing information`, {
        billCountry: createEnrollmentDto.BillCountry,
        billState: createEnrollmentDto.BillingState
      });
      
      const billingCountry = await queryRunner.manager.findOne(Country, {
        where: {
          id: createEnrollmentDto.BillCountry
        }
      });
      if (!billingCountry) {
        this.logger.error(`Billing country not found`, { countryId: createEnrollmentDto.BillCountry });
        throw new NotFoundException("Billing country not found");
      }

      const billingState = await queryRunner.manager.findOne(State, {
        where: {
          id: createEnrollmentDto.BillingState
        }
      });
      if (!billingState) {
        this.logger.error(`Billing state not found`, { stateId: createEnrollmentDto.BillingState });
        throw new NotFoundException("Billing state not found");
      }
      
      this.logger.log(`Billing validation successful`, {
        country: billingCountry.CountryName,
        state: billingState.name
      });

      

      //start the payment process
      this.logger.log(`Initiating payment process`, {
        amount: initialAmount,
        email: createEnrollmentDto.email,
        cardNumber: createEnrollmentDto.CCNo,
        cvv: createEnrollmentDto.CVV,
        expiry: createEnrollmentDto.CCExpiry,
        maskedCardNumber: this.maskCardNumber(createEnrollmentDto.CCNo)
      });
      
    
      const result = await this.authorizeNetService.chargeCreditCard(
        initialAmount,
        createEnrollmentDto.CCNo,
        createEnrollmentDto.CCExpiry,
        createEnrollmentDto.CVV,
        createEnrollmentDto.BillMail,
        '', ''
      );
      
      this.logger.log(`Payment processed successfully`, {
        transactionId: result.transId,
        amount: initialAmount,
        email: createEnrollmentDto.email
      });




      this.logger.log(`Creating enrollment record`, {
        studentId: student.id,
        enrollmentType: createEnrollmentDto.courseId ? "Course" : "Class",
        price: initialAmount,
        transactionId: result.transId
      });
      
      const enrollment = new Enrollment();
      enrollment.student = student;
      enrollment.course = !(createEnrollmentDto.courseId && !createEnrollmentDto.classId) ? null : enrollmentTarget as Course;
      enrollment.class = !(!createEnrollmentDto.courseId && createEnrollmentDto.classId) ? null : enrollmentTarget as Class;
      enrollment.BillCountry = billingCountry.CountryName;
      enrollment.BillingName = createEnrollmentDto.BillingName;
      enrollment.BillingState = billingState.name;
      enrollment.BillingAddress = createEnrollmentDto.BillingAddress;
      enrollment.BillingCity = createEnrollmentDto.BillingCity;
      enrollment.BillingState = billingState.name;
      enrollment.BillDate = new Date();
      enrollment.BillMail = createEnrollmentDto.BillMail;
      enrollment.CCNo = this.maskCardNumber(createEnrollmentDto.CCNo); // mask this
      enrollment.CCExpiry = createEnrollmentDto.CCExpiry;
      enrollment.Comments = createEnrollmentDto.Comments;
      enrollment.MealType = createEnrollmentDto.MealType;
      enrollment.PaymentMode = "Card";
      enrollment.Price = initialAmount;
      enrollment.TransactionId = result.transId;
      enrollment.BillPhone = createEnrollmentDto.BillPhone;
      enrollment.BillDate = new Date();
      enrollment.enrollmentType = createEnrollmentDto.courseId ? "Course" : "Class";
      enrollment.PMPPass = false;
      enrollment.CreditCardHolder = createEnrollmentDto.CreditCardHolder;
      enrollment.pmbok = false;
      enrollment.POID = result.transId;
      enrollment.Discount = enrollmentTarget.price - initialAmount;

      await queryRunner.manager.save(enrollment);
      
      this.logger.log(`Enrollment record saved successfully`, {
        enrollmentId: enrollment.ID,
        studentId: student.id,
        enrollmentType: enrollment.enrollmentType
      });

      const emailConfirmationData: StudentRegistrationData = {
        studentName: createEnrollmentDto.name,
        studentEmail: createEnrollmentDto.email,
        studentPhone: createEnrollmentDto.phone,
        studentAddress: createEnrollmentDto.address,
        className: enrollmentTarget instanceof Class ? enrollmentTarget.title : enrollmentTarget.courseName,
        location: createEnrollmentDto.BillingCity,
        startDate: enrollmentTarget instanceof Class ? new Date(enrollmentTarget.startDate) : new Date(),
        endDate: enrollmentTarget instanceof Class ? new Date(enrollmentTarget.endDate) : (() => {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + (enrollmentTarget.courseDuration || 0));
          return endDate;
        })(),
        paymentInfo: {
          method: enrollment.PaymentMode,
          cardLastFour: enrollment.CCNo,
          amount: initialAmount
        },
        billing: {
          name: createEnrollmentDto.BillingName,
          address: createEnrollmentDto.BillingAddress,
          city: createEnrollmentDto.BillingCity,
          state: billingState.name,
          country: billingCountry.CountryName,
          zip: createEnrollmentDto.zipCode,
          phone: createEnrollmentDto.BillPhone,
          email: createEnrollmentDto.BillMail,
        }
      };

      const portalLoginData: PortalLoginData = {
        studentName: createEnrollmentDto.name,
        studentEmail: createEnrollmentDto.email,
        className: enrollmentTarget instanceof Class ? enrollmentTarget.title : enrollmentTarget.courseName,
        location: createEnrollmentDto.BillingCity,
        startDate: enrollmentTarget instanceof Class ? new Date(enrollmentTarget.startDate) : new Date(),
        password: password,
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        classEndDate: enrollmentTarget instanceof Class ? new Date(enrollmentTarget.endDate) : (() => {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + (enrollmentTarget.courseDuration || 0));
          return endDate;
        })(),
      };




      this.logger.log(`Adding email confirmation job to queue`, {
        recipients: [createEnrollmentDto.email, process.env.ADMIN_EMAIL],
        jobType: EmailJobType.REGISTRATION_CONFIRMATION
      });
      
      await this.queueService.addJob({
        type: EmailJobType.REGISTRATION_CONFIRMATION,
        data: emailConfirmationData,
        recipients: [createEnrollmentDto.email, process.env.ADMIN_EMAIL]
      });

      this.logger.log(`Adding portal login job to queue`, {
        recipients: [createEnrollmentDto.email, process.env.ADMIN_EMAIL],
        jobType: EmailJobType.PORTAL_LOGIN
      });
      
      await this.queueService.addJob({
        type: EmailJobType.PORTAL_LOGIN,
        data: portalLoginData,
        recipients: [createEnrollmentDto.email, process.env.ADMIN_EMAIL]
      });


      await queryRunner.commitTransaction();
      
      this.logger.log(`Enrollment creation completed successfully`, {
        enrollmentId: enrollment.ID,
        studentId: student.id,
        email: createEnrollmentDto.email,
        enrollmentType: enrollment.enrollmentType,
        price: enrollment.Price,
        transactionId: enrollment.TransactionId
      });
      
      return enrollment;
    } catch (error) {
      this.logger.error(`Enrollment creation failed`, {
        error: error instanceof Error ? error.message : String(error),
        email: createEnrollmentDto.email,
        classId: createEnrollmentDto.classId,
        courseId: createEnrollmentDto.courseId,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      await queryRunner.rollbackTransaction();
      this.logger.log(`Transaction rolled back due to error`);
      
      throw new InternalServerErrorException("Error in create enrollment, " + error);
    } finally {
      await queryRunner.release();
    }
  }

  async bulkUpdate(bulkUpdateEnrollmentDto: BulkUpdateEnrollmentDto) {
    this.logger.log(`Starting bulk update operation`, {
      method: 'bulkUpdate',
      numberOfIds: bulkUpdateEnrollmentDto.ids.length,
      changes: Object.keys(bulkUpdateEnrollmentDto.changes)
    });
    
    try {
      const { ids, changes } = bulkUpdateEnrollmentDto;
      const result = await this.enrollmentRepository.update(ids, changes);
      
      this.logger.log(`Bulk update completed successfully`, {
        affectedRows: result.affected,
        numberOfIds: ids.length
      });
      
      return result;
    } catch (error) {
      this.logger.error(`Bulk update failed`, {
        error: error instanceof Error ? error.message : String(error),
        ids: bulkUpdateEnrollmentDto.ids,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  findAll() {
    return `This action returns all enrollment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} enrollment`;
  }

  async update(id: number, updateEnrollmentDto: UpdateEnrollmentDto) {
    this.logger.log(`Starting enrollment update`, {
      method: 'update',
      enrollmentId: id,
      updateFields: Object.keys(updateEnrollmentDto)
    });
    
    try {
      // Check if the enrollment exists
      const enrollment = await this.enrollmentRepository.findOne({
        where: { ID: id }
      });

      if (!enrollment) {
        this.logger.warn(`Enrollment not found for update`, { enrollmentId: id });
        throw new NotFoundException(`Enrollment with ID ${id} not found`);
      }

      this.logger.log(`Enrollment found, proceeding with update`, {
        enrollmentId: id,
        currentStatus: enrollment.enrollmentType
      });

      // Merge the existing enrollment with the new data
      const updated = this.enrollmentRepository.merge(enrollment, updateEnrollmentDto);

      // Save the updated enrollment
      await this.enrollmentRepository.save(updated);

      this.logger.log(`Enrollment updated successfully`, {
        enrollmentId: id,
        updateFields: Object.keys(updateEnrollmentDto)
      });

      // Return the updated enrollment
      return updated;
    } catch (error) {
      this.logger.error(`Enrollment update failed`, {
        error: error instanceof Error ? error.message : String(error),
        enrollmentId: id,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async remove(id: number): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Find the enrollment
      const enrollment = await queryRunner.manager.findOne(Enrollment, {
        where: { ID: id }
      });

      if (!enrollment) {
        throw new NotFoundException(`Enrollment with ID ${id} not found`);
      }

      // Delete the enrollment
      await queryRunner.manager.remove(Enrollment, enrollment);

      await queryRunner.commitTransaction();
      return `Successfully deleted enrollment #${id}`;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error deleting enrollment:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete all enrollments for a specific student
   * @param studentId - The ID of the student
   * @returns Promise<string> - Success message
   */
  async removeByStudentId(studentId: number): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Find all enrollments for the student
      const enrollments = await queryRunner.manager.find(Enrollment, {
        where: { student: { id: studentId } }
      });

      if (enrollments.length === 0) {
        return `No enrollments found for student #${studentId}`;
      }

      // Delete all enrollments
      await queryRunner.manager.remove(Enrollment, enrollments);

      await queryRunner.commitTransaction();
      return `Successfully deleted ${enrollments.length} enrollment(s) for student #${studentId}`;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error deleting enrollments for student:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
