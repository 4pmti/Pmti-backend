import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Promotions } from '../../promotions/entities/promotion.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('course_enrollments')
export class CourseEnrollment {
    @PrimaryGeneratedColumn()
    ID: number;

    @Column()
    CID: number;

    @Column()
    StudentID: number;

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

    @Column({ type: 'enum', enum: ['Vegetarian', 'Non-Vegetarian'] })
    MealType: string;

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

    @Column({ nullable: true })
    CCNo: string;

    @Column({ nullable: true })
    CCExpiry: string;

    @Column({ unique: true })
    TransactionId: string;

    @Column({ default: false })
    pmbok: boolean;

    @Column({ nullable: true })
    CreditCardHolder: string;

    @Column({ nullable: true })
    ssno: string;
}