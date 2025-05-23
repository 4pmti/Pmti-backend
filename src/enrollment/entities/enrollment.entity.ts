import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Promotions } from '../../promotions/entities/promotion.entity';
import { User } from 'src/user/entities/user.entity';
import { Course } from 'src/course/entities/course.entity';
import { Student } from 'src/student/entities/student.entity';
import { Class } from 'src/class/entities/class.entity';
import { enrollmentMeal, enrollmentProgress } from 'src/common/enums/enums';

@Entity('enrollments')
export class Enrollment {
    @PrimaryGeneratedColumn()
    ID: number;

    @ManyToOne(() => Class, { nullable: true })
    @JoinColumn({ name: 'classId' })
    class: Class;

    @ManyToOne(() => Course, { nullable: true })
    @JoinColumn({ name: 'courseId' })
    course: Course;

    @ManyToOne(() => Student, { nullable: false })
    student: Student;

    @Column({ type: 'enum', enum: ['Course', 'Class'] })
    enrollmentType: string;

    @CreateDateColumn()
    EnrollmentDate: Date;

    @Column({ type: 'text', nullable: true })
    Comments: string;


    @Column()
    BillingName: string;

    @Column()
    BillingAddress: string;

    @Column()
    BillingCity: string;

    @Column()
    BillingState: string;

    @Column()
    BillCountry: string;

    @Column()
    BillPhone: string;

    @Column()
    BillMail: string;

    @Column()
    BillDate: Date;

    // Tracking Information
    @ManyToOne(() => User)
    @JoinColumn({ name: 'AddedBy' })
    AddedBy: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'UpdatedBy' })
    UpdatedBy: User;

    @Column({ default: false })
    isDelete: boolean;

    // Course-specific Information
    @Column({ default: false })
    PMPPass: boolean;

    @Column({ nullable: true })
    CourseExpiryDate: Date;

    @Column({ type: 'enum', enum: enrollmentMeal })
    MealType: string;

    @Column({ type: 'enum', enum: enrollmentProgress, default: enrollmentProgress.ONGOING })
    enrollmentProgress: string;

    @Column({ default: true })
    status: boolean;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    Price: number;

    @ManyToOne(() => Promotions, { nullable: true })
    @JoinColumn({ name: 'PromotionID' })
    PromotionID: Promotions;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    Discount: number;

    // Payment Information
    @Column()
    PaymentMode: string;

    @Column({ nullable: true })
    POID: string;

    @Column({ nullable: true }) //last digit number of credit card - xxxx-xxxx-0123
    CCNo: string;

    @Column({ nullable: true }) // card expiry date
    CCExpiry: string;

    @Column({ unique: true, nullable: true })
    TransactionId: string;

    @Column({ default: false })
    pmbok: boolean;

    @Column({ nullable: true }) //credit card holder name
    CreditCardHolder: string;

    @Column({ nullable: true })
    ssno: string;
}