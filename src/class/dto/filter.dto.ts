import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class FilterDto {

    @ApiPropertyOptional()
    page?: number;

    @ApiPropertyOptional()
    limit?: number;

    @ApiPropertyOptional()
    search?: string;

    @ApiPropertyOptional()
    sort?: string;

    @ApiPropertyOptional({ description: 'The start date for filtering' })
    startFrom?: Date;

    @ApiPropertyOptional({ description: 'The end date for filtering' })
    dateTo?: Date;

    @ApiPropertyOptional({ description: 'The ID of the class type' })
    classType?: number;

    @ApiPropertyOptional({ description: 'The ID of the course category' })
    courseCategory?: number;

    @ApiPropertyOptional({ description: 'The ID of the location' })
    locationId?: number;

    @ApiPropertyOptional({ description: 'The ID of the instructor' })
    instructorId?: number;

    @ApiPropertyOptional({ description: 'The ID of the country' })
    countryId?: number;
}




export enum SortTypes {

}