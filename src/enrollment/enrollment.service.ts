import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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


  async create(createEnrollmentDto: CreateEnrollmentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    // console.log(createEnrollmentDto);
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
      enrollment.CCNo =  this.maskCardNumber(createEnrollmentDto.CCNo); // mask this
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
         studentPhone : createEnrollmentDto.phone,
         startDate: enrollmentTarget instanceof Class ? new Date(enrollmentTarget.startDate) : new Date(),
         endDate: enrollmentTarget instanceof Class ? new Date(enrollmentTarget.endDate) : new Date(),
         studentEmail: createEnrollmentDto.email,
         studentName : createEnrollmentDto.name,
         studentAddress : createEnrollmentDto.address,
         className: enrollmentTarget instanceof Class ? enrollmentTarget.title : "",
         location : createEnrollmentDto.city,
         paymentInfo : {
          method : enrollment.PaymentMode,
          cardLastFour : enrollment.CCNo,
          amount :initialAmount
         },
         billing :{
          name : createEnrollmentDto.BillingName,
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
