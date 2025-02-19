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
  ) { }

  private maskCardNumber(cardNumber: string): string {
    return cardNumber.replace(/\d(?=\d{4})/g, 'X'); // Masks all but the last 4 digits
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
      console.log(rescheduleDto);
      const student = await queryRunner.manager.findOne(Student, {
        where: {
          id: rescheduleDto.studentId
        }
      });
      console.log(student);

      if (!student) {
        throw new NotFoundException('Student not found');
      }

      const classs = await queryRunner.manager.findOne(Class, {
        where: {
          id: rescheduleDto.studentId
        }
      });

      console.log(classs);

      if (!classs) {
        throw new NotFoundException('Class not found');
      }

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
          Comments: `reschedule paid amount ${rescheduleDto.amount} on ${Date.now()}`
        });
      }
      await queryRunner.manager.update(Enrollment, enrollment.ID, {
        class: classs,
        Comments: `reschedule class on ${Date.now()}`
      });
      const updatedEnrollment = await queryRunner.manager.findOne(Enrollment, {
        where: {
          ID: enrollment.ID
        }
      });
      await queryRunner.commitTransaction();
      return updatedEnrollment;
    } catch (error) {
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

      const pastEnrollment = await queryRunner.manager.findOne(Enrollment, {
        where: {
          POID: offlineEnrollment.purchaseOrderId
        }
      });

      if (!pastEnrollment) {
        throw new NotFoundException("Enrollment not found");
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

        if (classs.category.id != promotion.category.id) {
          throw new BadRequestException("This promotion is not valid for this class.");
        }
        console.log(initialAmount, promotion.amount);
        initialAmount -= promotion.amount;
        if (initialAmount < 0) {
          initialAmount = 0;
        }
      }

      //start the payment process
      const result = await this.authorizeNetService.chargeCreditCard(
        initialAmount,
        offlineEnrollment.CCNo,
        offlineEnrollment.CCExpiry,
        offlineEnrollment.CVV,
        offlineEnrollment.BillMail,
        '', ''
      );
      const enrollment = new Enrollment();
      enrollment.student = student;
      enrollment.course = null;
      enrollment.class = classs;
      enrollment.Comments = offlineEnrollment.Comments;
      enrollment.BillCountry = offlineEnrollment.BillCountry;
      enrollment.BillingCity = offlineEnrollment.zipCode;
      enrollment.BillingName = offlineEnrollment.BillingName;
      enrollment.BillingState = offlineEnrollment.BillingState;
      enrollment.BillingAddress = offlineEnrollment.BillingAddress;
      enrollment.BillingCity = offlineEnrollment.BillingCity;
      enrollment.BillingState = offlineEnrollment.BillingState;
      enrollment.BillDate = new Date();
      enrollment.BillMail = offlineEnrollment.BillMail;
      enrollment.CCNo = this.maskCardNumber(offlineEnrollment.CCNo); // mask this
      enrollment.CCExpiry = offlineEnrollment.CCExpiry;
      enrollment.Comments = offlineEnrollment.Comments;
      enrollment.MealType = offlineEnrollment.MealType;
      enrollment.PaymentMode = offlineEnrollment.cardType;
      enrollment.Price = initialAmount;
      enrollment.TransactionId = result.transId;
      enrollment.BillPhone = offlineEnrollment.BillPhone;
      enrollment.BillDate = new Date();
      enrollment.enrollmentType = "Class";
      enrollment.PMPPass = false;
      enrollment.CreditCardHolder = offlineEnrollment.CreditCardHolder;
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

      const pastEnrollment = await queryRunner.manager.findOne(Enrollment, {
        where: {
          POID: offlineEnrollment.purchaseOrderId
        }
      });

      if (!pastEnrollment) {
        throw new NotFoundException("Enrollment not found");
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
          throw new BadRequestException("This promotion is not valid for this class.");
        }
        console.log(initialAmount, promotion.amount);
        initialAmount -= promotion.amount;
        if (initialAmount < 0) {
          initialAmount = 0;
        }
      }

      //start the payment process
      const result = await this.authorizeNetService.chargeCreditCard(
        initialAmount,
        offlineEnrollment.CCNo,
        offlineEnrollment.CCExpiry,
        offlineEnrollment.CVV,
        offlineEnrollment.BillMail,
        '', ''
      );
      const enrollment = new Enrollment();
      enrollment.student = student;
      enrollment.course = course;
      enrollment.class = null;
      enrollment.Comments = offlineEnrollment.Comments;
      enrollment.BillCountry = offlineEnrollment.BillCountry;
      enrollment.BillingCity = offlineEnrollment.zipCode;
      enrollment.BillingName = offlineEnrollment.BillingName;
      enrollment.BillingState = offlineEnrollment.BillingState;
      enrollment.BillingAddress = offlineEnrollment.BillingAddress;
      enrollment.BillingCity = offlineEnrollment.BillingCity;
      enrollment.BillingState = offlineEnrollment.BillingState;
      enrollment.BillDate = new Date();
      enrollment.BillMail = offlineEnrollment.BillMail;
      enrollment.CCNo = this.maskCardNumber(offlineEnrollment.CCNo); // mask this
      enrollment.CCExpiry = offlineEnrollment.CCExpiry;
      enrollment.Comments = offlineEnrollment.Comments;
      enrollment.MealType = offlineEnrollment.MealType;
      enrollment.PaymentMode = offlineEnrollment.cardType;
      enrollment.Price = initialAmount;
      enrollment.TransactionId = result.transId;
      enrollment.BillPhone = offlineEnrollment.BillPhone;
      enrollment.BillDate = new Date();
      enrollment.enrollmentType = "Course";
      enrollment.PMPPass = false;
      enrollment.CreditCardHolder = offlineEnrollment.CreditCardHolder;
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


      //validate the student
      let student = await queryRunner.manager.findOne(Student, {
        where: {
          email: createEnrollmentDto.email
        }
      });

      if (!student) {
        try {
          student = await this.userService.createStudent({
            name: createEnrollmentDto.name,
            email: createEnrollmentDto.email,
            address: createEnrollmentDto.address,
            zipCode: createEnrollmentDto.zipCode,
            city: createEnrollmentDto.city,
            phone: createEnrollmentDto.phone,
            state: createEnrollmentDto.state,
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
      enrollment.BillCountry = createEnrollmentDto.BillCountry;
      enrollment.BillingCity = createEnrollmentDto.zipCode;
      enrollment.BillingName = createEnrollmentDto.BillingName;
      enrollment.BillingState = createEnrollmentDto.BillingState;
      enrollment.BillingAddress = createEnrollmentDto.BillingAddress;
      enrollment.BillingCity = createEnrollmentDto.BillingCity;
      enrollment.BillingState = createEnrollmentDto.BillingState;
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
      await queryRunner.commitTransaction();

      this.emailService.sendRegistrationEmails({
        studentPhone: createEnrollmentDto.phone,
        startDate: enrollmentTarget instanceof Class ? new Date(enrollmentTarget.startDate) : new Date(),
        endDate: enrollmentTarget instanceof Class ? new Date(enrollmentTarget.endDate) : new Date(),
        studentEmail: createEnrollmentDto.email,
        studentName: createEnrollmentDto.name,
        studentAddress: createEnrollmentDto.address,
        className: enrollmentTarget instanceof Class ? enrollmentTarget.title : "",
        location: createEnrollmentDto.city,
        paymentInfo: {
          method: enrollment.PaymentMode,
          cardLastFour: enrollment.CCNo,
          amount: initialAmount
        },
        billing: {
          name: createEnrollmentDto.BillingName,
          address: createEnrollmentDto.BillingAddress,
          city: createEnrollmentDto.BillingCity,
          state: createEnrollmentDto.BillingState,
          country: createEnrollmentDto.BillCountry,
          zip: createEnrollmentDto.zipCode,
          phone: createEnrollmentDto.BillPhone,
          email: createEnrollmentDto.BillMail,
        }

      });
      return enrollment;
    } catch (error) {
      console.log(error);
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
      console.log(updateEnrollmentDto);
      await this.enrollmentRepository.update(id, updateEnrollmentDto);
      return await this.enrollmentRepository.findOne({
        where: {
          ID: id
        }
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} enrollment`;
  }
}
