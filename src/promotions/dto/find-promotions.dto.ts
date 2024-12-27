// promotions.dto.ts

export class FindPromotionsDto {
    /**
     * Filter by ID (partial match)
     */
    id?: string;
  
    /**
     * Filter by amount with optional conditions
     */
    amount?: {
      lt?: number; // Less than
      gt?: number; // Greater than
      eq?: number; // Equal to
    };
  
    /**
     * Filter by country (partial match)
     */
    countryId?: number;
  
    /**
     * Filter by start date (inclusive)
     */
    startDateFrom?: Date;
  
    /**
     * Filter by end date (inclusive)
     */
    endDateTo?: Date;
  }
  