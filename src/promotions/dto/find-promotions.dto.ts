import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindPromotionsDto {
    @ApiPropertyOptional({ description: 'Filter by ID (partial match)', example: 'PROMO' })
    id?: string;

    @ApiPropertyOptional({
      description: 'Filter by amount with conditions: lt (less than), gt (greater than), eq (equal to)',
      example: { lt: 100, gt: 10 },
    })
    amount?: {
      lt?: number;
      gt?: number;
      eq?: number;
    };

    @ApiPropertyOptional({ type: Number, description: 'Filter by country ID', example: 1 })
    countryId?: number;

    @ApiPropertyOptional({ description: 'Filter by start date (inclusive)', example: '2025-01-01' })
    startDateFrom?: Date;

    @ApiPropertyOptional({ description: 'Filter by end date (inclusive)', example: '2025-12-31' })
    endDateTo?: Date;
  }
  