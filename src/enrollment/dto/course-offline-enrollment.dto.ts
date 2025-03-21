import { IsBoolean, IsDate, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class OfflineCourseEnrollmentDto {
    

    @ValidateIf(o => !o.courseId)
    @IsNumber()
    @IsNotEmpty({ message: 'Class ID is required when Course ID is not provided' })
    courseId?: number;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    Comments?: string;

    @IsString()
    purchaseOrderId:string;

    @IsString()
    @IsOptional()
    cardType:string;

    @IsNumber()
    studentId : number;

    @IsNumber()
    amount:number;

    // Billing Information
    @IsString()
    @IsNotEmpty()
    BillingName: string;

    @IsString()
    @IsNotEmpty()
    BillingAddress: string;

    @IsString()
    @IsNotEmpty()
    BillingCity: string;

    @IsString()
    @IsNotEmpty()
    BillingState: string;

    @IsString()
    @IsNotEmpty()
    BillCountry: string;

    @IsString()
    @IsNotEmpty()
    BillPhone: string;

    @IsEmail()
    @IsNotEmpty()
    BillMail: string;

    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    BillDate: Date;

    // Student Information
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    state: string;

    @IsString()
    @IsNotEmpty()
    country: string;

    @IsString()
    @IsNotEmpty()
    zipCode: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsOptional()
    companyName?: string;

    @IsString()
    @IsNotEmpty()
    profession: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    // Course Related
    @IsBoolean()
    @IsOptional()
    PMPPass?: boolean;

    @IsEnum(['Vegetarian', 'Non-Vegetarian'])
    @IsNotEmpty()
    MealType: 'Vegetarian' | 'Non-Vegetarian';

    @IsOptional()
    Promotion?: string;

    // Payment Information
    @IsString()
    @IsNotEmpty({ message: 'Credit Card number is required' })
    CCNo: string;

    @IsString()
    @IsNotEmpty({message: 'CVV  is required'})
    CVV: string;

    @IsString()
    @IsNotEmpty()
    CCExpiry?: string;

    @IsString()
    @IsOptional()
    CreditCardHolder?: string;

    // Additional Options
    @IsBoolean()
    @IsOptional()
    pmbok?: boolean;

    @IsBoolean()
    @IsOptional()
    downloadedInfoPac?: boolean;
}