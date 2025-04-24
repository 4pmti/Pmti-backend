import { IsNumber, IsOptional } from "class-validator";
import { Transform } from "class-transformer";
export class FindAllDto {
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    countryId: number;
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    stateId: number;
}