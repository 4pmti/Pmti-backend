import { IsNotEmpty, IsString, MaxLength, IsOptional, IsBoolean } from "class-validator";
import { Country } from "src/country/entities/country.entity";

export class CreateLocationDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    location: string;
  
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    addedBy: string;
  
    @IsOptional() 
    @IsString()
    @MaxLength(100)
    updatedBy: string;
  
    @IsOptional()
    @IsBoolean()
    isDelete: boolean;
  
    @IsNotEmpty()
    country: number;  

}