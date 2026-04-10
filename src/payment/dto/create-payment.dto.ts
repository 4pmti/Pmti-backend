import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEmail } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePaymentDto {
    // Payment Information
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ example: 299.99, description: 'Payment amount in USD' })
    amount: number;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: '4111111111111111', description: 'Credit card number' })
    cardNumber: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: '12/2027', description: 'Card expiration date (MM/YYYY)' })
    expirationDate: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: '123', description: 'Card CVV/security code' })
    cvv: string;

    @IsString()
    @IsOptional()
    invoiceNumber: string;

    @IsString()
    @IsOptional()
    description: string;

    // Customer Billing Information
    @IsNotEmpty()
    @IsString()
    studentLastName: string;

    @IsNotEmpty()
    @IsString()
    studentFirstName: string;

    @IsString()
    @IsOptional()
    company: string;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsString()
    city: string;

    @IsNotEmpty()
    @IsString()
    state: string;

    @IsNotEmpty()
    @IsString()
    zip: string;

    @IsNotEmpty()
    @IsString()
    country: string;

    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    // Student Information
    @IsNotEmpty()
    @IsString()
    studentAddress: string;

    @IsNotEmpty()
    @IsString()
    studentCity: string;

    @IsNotEmpty()
    @IsString()
    studentState: string;

    @IsNotEmpty()
    @IsString()
    studentZip: string;

    @IsNotEmpty()
    @IsString()
    studentCountry: string;

    @IsNotEmpty()
    @IsString()
    studentPhone: string;

    @IsNotEmpty()
    @IsEmail()
    studentEmail: string;

    // Transaction Information (Optional)
    @IsString()
    @IsOptional()
    transactionKey: string;

    @IsString()
    @IsOptional()
    transactionName: string;


    @IsString()
    @IsOptional()
    transactionId?:string;
}
