import { IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";

export class CreateStateDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    name: string;

    @IsNotEmpty()
    @IsNumber()
    countryId : number

}
