import { IsBoolean, IsDate, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEnrollmentDto {
    @ValidateIf(o => !o.classId)
    @IsNumber()
    @IsNotEmpty({ message: 'Course ID is required when Class ID is not provided' })
    courseId?: number;

    @ValidateIf(o => !o.courseId)
    @IsNumber()
    @IsNotEmpty({ message: 'Class ID is required when Course ID is not provided' })
    classId?: number;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    Comments?: string;

    // Billing Information
    @IsString()
    @IsNotEmpty()
    BillingName: string;

    @IsString()
    @IsNotEmpty()
    BillingAddress: string;

    @IsNumber()
    @Type(() => Number)
    BillingCity: number;

    @IsNumber()
    @Type(() => Number)
    BillingState: number;

    @IsNumber()
    @Type(() => Number)
    BillCountry: number;

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

    @IsNumber()
    @IsNotEmpty()
    city: number;
    
    @IsString()
    @IsNotEmpty()
    state: string;

    @IsNumber()
    @IsNotEmpty()
    country: number;

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