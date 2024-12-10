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
}




export enum SortTypes {

}