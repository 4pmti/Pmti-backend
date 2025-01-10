import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEmail } from "class-validator";

export class CreatePaymentDto {
    // Payment Information
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsString()
    cardNumber: string;

    @IsNotEmpty()
    @IsString()
    expirationDate: string;

    @IsNotEmpty()
    @IsString()
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
