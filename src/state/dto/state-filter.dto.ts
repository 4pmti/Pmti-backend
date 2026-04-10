import { ApiPropertyOptional } from '@nestjs/swagger';

export class StateFilterDto {
    @ApiPropertyOptional({ type: Number, description: 'Filter states by country ID', example: 1 })
    countryId?: number;

    @ApiPropertyOptional({ type: Number, description: 'Filter by specific state ID', example: 5 })
    stateId?: number;
  }