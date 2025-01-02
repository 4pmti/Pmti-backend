import { IsNotEmpty, IsEmail, IsOptional, IsEnum, IsNumber, IsDate, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class CreateCourseEnrollmentDto {
    @IsNotEmpty()
    @IsNumber()
    CID: number;

    @IsNotEmpty()
    @IsNumber()
    StudentID: number;

    @IsOptional()
    Comments?: string;

    @IsNotEmpty()
    @MinLength(2)
    BillingName: string;

    @IsNotEmpty()
    BillingAddress: string;

    @IsNotEmpty()
    BillingCity: string;

    @IsNotEmpty()
    BillingState: string;

    @IsNotEmpty()
    BillCountry: string;

    @IsNotEmpty()
    @MinLength(10)
    BillPhone: string;

    @IsNotEmpty()
    @IsEmail()
    BillMail: string;

    @IsNotEmpty()
    BillDate: Date;

    @IsOptional()
    @IsBoolean()
    PMPPass?: boolean;

    @IsOptional()
    CourseExpiryDate?: Date;

    @IsNotEmpty()
    @IsEnum(['Vegetarian', 'Non-Vegetarian'])
    MealType: string;

    @IsNotEmpty()
    @IsNumber()
    Price: number;

    @IsOptional()
    @IsNumber()
    PromotionID?: number;

    @IsOptional()
    @IsNumber()
    Discount?: number;

    @IsNotEmpty()
    PaymentMode: string;

    @IsOptional()
    POID?: string;

    @IsOptional()
    @MinLength(4)
    @MaxLength(16)
    CCNo?: string;

    @IsOptional()
    CCExpiry?: string;

    @IsOptional()
    TransactionId?: string;

    @IsOptional()
    @IsBoolean()
    pmbok?: boolean;

    @IsOptional()
    CreditCardHolder?: string;

    @IsOptional()
    ssno?: string;
}