import { Type, Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsString } from "class-validator";
import { IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { classStatus } from "src/common/enums/enums";

export class FilterDto {

    @ApiPropertyOptional({ type: Number, description: 'Page number for pagination', example: 1 })
    page?: number;

    @ApiPropertyOptional({ type: Number, description: 'Number of items per page', example: 10 })
    limit?: number;

    @ApiPropertyOptional({ description: 'Search term for title or description', example: 'PMP' })
    search?: string;

    @ApiPropertyOptional({ description: 'Sort field and direction (e.g. startDate:ASC, price:DESC)', example: 'startDate:ASC' })
    sort?: string;

    @ApiPropertyOptional({ description: 'Filter classes starting from this date', example: '2025-01-01' })
    startFrom?: Date|string;

    @ApiPropertyOptional({ description: 'Filter classes up to this date', example: '2025-12-31' })
    dateTo?: Date;

    @ApiPropertyOptional({ type: Number, description: 'Filter by class type ID' })
    classType?: number;

    @ApiPropertyOptional({ type: Number, description: 'Filter by course category ID' })
    courseCategory?: number;

    @ApiPropertyOptional({ type: Number, description: 'Filter by location ID' })
    locationId?: number;

    @IsString()
    @IsOptional()
    locationName?: string;

    @ApiPropertyOptional({ type: Number, description: 'Filter by instructor ID' })
    instructorId?: number;

    @ApiPropertyOptional({ type: Number, description: 'Filter by country ID' })
    countryId?: number;

    @ApiPropertyOptional({ type: Number, description: 'Filter by state ID' })
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