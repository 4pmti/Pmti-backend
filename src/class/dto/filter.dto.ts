
import { IsBoolean, IsEnum } from "class-validator";
import { IsOptional } from "class-validator";
import { classStatus } from "src/common/enums/enums";

export class FilterDto {


    page?: number;


    limit?: number;


    search?: string;


    sort?: string;


    startFrom?: Date;


    dateTo?: Date;


    classType?: number;


    courseCategory?: number;


    locationId?: number;


    instructorId?: number;


    countryId?: number;


    stateId?: number;


    @IsEnum(classStatus)
    @IsOptional()
    status?: classStatus;


    @IsBoolean()
    @IsOptional()
    isCancel?: boolean;


    @IsBoolean()
    @IsOptional()
    isCorpClass?: boolean;


    
}




export enum SortTypes {

}