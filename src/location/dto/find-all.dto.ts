import { IsNumber, IsOptional } from "class-validator";

export class FindAllDto {
    @IsOptional()
    @IsNumber()
    countryId: number;
    @IsOptional()
    @IsNumber()
    stateId: number;
}