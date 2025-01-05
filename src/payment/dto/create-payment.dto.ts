import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePaymentDto {
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
    customerEmail: string;

    @IsString()
    @IsOptional()
    transactionKey: string;

    @IsString()
    @IsOptional()
    transactionName: string;

}
