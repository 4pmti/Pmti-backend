import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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



  //TODO : implement this 
  async rescheduleClass(userId: string, rescheduleDto: RescheduleDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (!await isAdmin(userId, this.userRepository)) {
        throw new UnauthorizedException("You dont have permission to perform this action!!!");
      }
      //fetch the admin name
      const user = await queryRunner.manager.findOne(User, {
        where: {
          id: userId
        }
      });
      console.log(rescheduleDto);

      //fetch the student
      const student = await queryRunner.manager.findOne(Student, {
        where: {
          id: rescheduleDto.studentId
        }
      });
      console.log(student);

      if (!student) {
        throw new NotFoundException('Student not found');
      }

      //fetch the class
      const classs = await queryRunner.manager.findOne(Class, {
        where: {
          id: rescheduleDto.classId
        },
        relations: {
          location: true
        }
      });

      console.log(classs);

      if (!classs) {
        throw new NotFoundException('Class not found');
      }

      //fetch the enrollment
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
      console.log(enrollment);
      if (!enrollment) {
        throw new NotFoundException('Enrollment not found');
      }

      if (rescheduleDto.isPaid) {
        const result = await this.authorizeNetService.chargeCreditCard(
          rescheduleDto.amount,
          rescheduleDto.ccNo,
          rescheduleDto.CCExpiry,
          rescheduleDto.CVV,
          student.name,
          '', ''
        );
        await queryRunner.manager.update(Enrollment, enrollment.ID, {
          class: classs,
          Comments: enrollment.Comments + `\nreschedule paid amount ${rescheduleDto.amount} on ${new Date().toISOString()}`
        });
      }

      //move the enrollment to the new class
      await queryRunner.manager.update(Enrollment, enrollment.ID, {
        class: classs,
        Comments: enrollment.Comments + `\nreschedule class on ${new Date().toISOString()}`
      });
      const updatedEnrollment = await queryRunner.manager.findOne(Enrollment, {
        where: {
          ID: enrollment.ID
        }
      });

      console.log(classs.location);

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

      await this.queueService.addJob({
        type: EmailJobType.RESCHEDULE_CONFIRMATION,
        data: rescheduleEmailData,
        recipients: [student.email, process.env.ADMIN_EMAIL]
      });
      console.log(rescheduleEmailData);
      await queryRunner.commitTransaction();
      return updatedEnrollment;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createOfflineClassEnrollment(userId: string, offlineEnrollment: OfflineClassEnrollmentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    console.log(offlineEnrollment);
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
        console.log(initialAmount, promotion.amount);
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
      console.log(error);
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
    console.log(offlineEnrollment);
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

        if (course.category.id != promotion.category.id) {
          throw new BadRequestException("This promotion is not valid for this course.");
        }
        console.log(initialAmount, promotion.amount);
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
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }


  async create(createEnrollmentDto: CreateEnrollmentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    console.log(createEnrollmentDto);
    try {
      //validate the class and course
      if (createEnrollmentDto.classId && createEnrollmentDto.courseId) {
        throw new NotFoundException("Either Class or Course is required");
      }



      // find user by email and check if hes already enrolled in this class or course
      const user = await queryRunner.manager.findOne(User, {
        where: {
          email: createEnrollmentDto.email
        },
        relations: {
          student: true
        }
      });

      if (user) {
        const enrollment = await queryRunner.manager.find(Enrollment, {
          where: {
            student: user.student,
          }
        });
        if (enrollment.length > 0) {
          throw new BadRequestException("You are already enrolled in this class or course");
        }
      }

      let enrollmentTarget: Class | Course;
      if (createEnrollmentDto.courseId) {
        enrollmentTarget = await queryRunner.manager.findOne(Course, {
          where: {
            id: createEnrollmentDto.courseId
          },
          relations: {
            category: true
          }
        });
        if (!enrollmentTarget) {
          throw new NotFoundException("Course not found");
        }
      } else if (createEnrollmentDto.classId) {

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
          throw new NotFoundException("Class not found");
        }
      }






      // check location, state and country
      // const location = await queryRunner.manager.findOne(Location, {
      //   where: {
      //     id: createEnrollmentDto.city as number
      //   }
      // });
      // if (!location) {
      //   throw new NotFoundException("Location not found");
      // }

      // const state = await queryRunner.manager.findOne(State, {
      //   where: {
      //     id: createEnrollmentDto.state
      //   }
      // });
      // if (!state) {
      //   throw new NotFoundException("State not found");
      // }

      const country = await queryRunner.manager.findOne(Country, {
        where: {
          id: createEnrollmentDto.country
        }
      });




      //validate the student
      let student = await queryRunner.manager.findOne(Student, {
        where: {
          email: createEnrollmentDto.email
        }
      });



      const password = this.generateRandomPassword();
      if (!student) {
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
        } catch (error) {
          console.log(error);
          throw error;
        }
      }

      //check for the promotions here and validate them
      let initialAmount = enrollmentTarget.price;
      const currentDate = new Date();
      if (createEnrollmentDto.Promotion) {
        const promotion = await queryRunner.manager.findOne(Promotions, {
          where: {
            promotionId: createEnrollmentDto.Promotion
          },
          relations: {
            category: true,
            country: true
          }
        });
        console.log(promotion);

        if (!promotion) {
          throw new NotFoundException("Promotion is not valid");
        }

        //time range validation check
        if (promotion.startDate && promotion.endDate) {
          if (currentDate < new Date(promotion.startDate) || currentDate > new Date(promotion.endDate)) {
            throw new BadRequestException("Promotion is not active");
          }
        }

        //class & country belonging check
        if (enrollmentTarget instanceof Class) {
          // console.log(enrollmentTarget.category, promotion.category);
          if (enrollmentTarget.category.id != promotion.category.id) {
            throw new BadRequestException("This promotion is not valid for this class.");
          }

          if (enrollmentTarget.country.id != promotion.country.id) {
            throw new BadRequestException("This promotion is not valid for this location.");
          }
          initialAmount -= promotion.amount;
          if (initialAmount < 0) {
            initialAmount = 0;
          }
        }
        if (enrollmentTarget instanceof Course) {
          if (enrollmentTarget.category.id != promotion.category.id) {
            throw new BadRequestException("This promotion is not valid for this course.");
          }
          console.log(initialAmount, promotion.amount);
          initialAmount -= promotion.amount;
          if (initialAmount < 0) {
            initialAmount = 0;
          }
        }
      }

      // search for billing country ,state and city
      const billingCountry = await queryRunner.manager.findOne(Country, {
        where: {
          id: createEnrollmentDto.BillCountry
        }
      });
      if (!billingCountry) {
        throw new NotFoundException("Billing country not found");
      }

      const billingState = await queryRunner.manager.findOne(State, {
        where: {
          id: createEnrollmentDto.BillingState
        }
      });
      if (!billingState) {
        throw new NotFoundException("Billing state not found");
      }

      

      //start the payment process
      const result = await this.authorizeNetService.chargeCreditCard(
        initialAmount,
        createEnrollmentDto.CCNo,
        createEnrollmentDto.CCExpiry,
        createEnrollmentDto.CVV,
        createEnrollmentDto.BillMail,
        '', ''
      );




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




      await this.queueService.addJob({
        type: EmailJobType.REGISTRATION_CONFIRMATION,
        data: emailConfirmationData,
        recipients: [createEnrollmentDto.email, process.env.ADMIN_EMAIL]
      });

      await this.queueService.addJob({
        type: EmailJobType.PORTAL_LOGIN,
        data: portalLoginData,
        recipients: [createEnrollmentDto.email, process.env.ADMIN_EMAIL]
      });


      await queryRunner.commitTransaction();
      return enrollment;
    } catch (error) {
      console.log("error in create enrollment", error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async bulkUpdate(bulkUpdateEnrollmentDto: BulkUpdateEnrollmentDto) {
    try {
      const { ids, changes } = bulkUpdateEnrollmentDto;
      return await this.enrollmentRepository.update(ids, changes);
    } catch (error) {
      console.log(error);
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
    try {
      // Check if the enrollment exists
      const enrollment = await this.enrollmentRepository.findOne({
        where: { ID: id }
      });

      if (!enrollment) {
        throw new NotFoundException(`Enrollment with ID ${id} not found`);
      }

      // Merge the existing enrollment with the new data
      const updated = this.enrollmentRepository.merge(enrollment, updateEnrollmentDto);

      // Save the updated enrollment
      await this.enrollmentRepository.save(updated);

      // Return the updated enrollment
      return updated;
    } catch (e) {
      console.log(e);
      throw e;
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
