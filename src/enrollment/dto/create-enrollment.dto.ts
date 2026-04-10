import { IsBoolean, IsDate, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

    @IsString()
    @IsNotEmpty()
    BillingCity: string;

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

  
    city: number|string;
    
    @IsNumber()
    state: number;

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
    @ApiProperty({ enum: ['Vegetarian', 'Non-Vegetarian'], example: 'Vegetarian' })
    MealType: 'Vegetarian' | 'Non-Vegetarian';

    @IsOptional()
    @ApiPropertyOptional({ description: 'Promotion code to apply', example: 'EARLYBIRD20' })
    Promotion?: string;

    // Payment Information
    @IsString()
    @IsNotEmpty({ message: 'Credit Card number is required' })
    @ApiProperty({ example: '4111111111111111', description: 'Credit card number' })
    CCNo: string;

    @IsString()
    @IsNotEmpty({message: 'CVV  is required'})
    @ApiProperty({ example: '123', description: 'Card CVV/security code' })
    CVV: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: '12/2027', description: 'Card expiration date (MM/YYYY)' })
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