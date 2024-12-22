import { ApiPropertyOptional } from "@nestjs/swagger";

export class InstructorFilterDto {

    @ApiPropertyOptional({ description: 'Filter by name' })
    nameLike?: string;

    @ApiPropertyOptional({ description: 'Filter by email' })
    emailLike?: string;

    @ApiPropertyOptional({ description: 'Filter by status' })
    status?: InstructorStatus;
}

export enum InstructorStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ALL = 'all'
}