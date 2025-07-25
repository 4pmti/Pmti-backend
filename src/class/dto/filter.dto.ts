import { Type, Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsString } from "class-validator";
import { IsOptional } from "class-validator";
import { classStatus } from "src/common/enums/enums";

export class FilterDto {


    page?: number;


    limit?: number;


    search?: string;


    sort?: string;


    startFrom?: Date|string;


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
    @Transform(({ value }) => value === 'true')
    isCancel?: boolean;


    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    isCorpClass?: boolean;
    
    @IsString()
    @IsOptional()
    nearbyLocation?: string;
}




export enum SortTypes {

}
// sort by startDate:ASC, endDate:DESC, price:ASC, price:DESC, status:ASC, status:DESC, isCancel:ASC, isCancel:DESC, isCorpClass:ASC, isCorpClass:DESC