import { IsNotEmpty, IsOptional } from "class-validator";
import { reviewCategory } from "src/common/enums/enums";

export class CreateReviewDto {
    @IsNotEmpty()
    category: reviewCategory;
    
    rating: number;
    
    @IsNotEmpty()
    review: string;
    
    @IsNotEmpty()
    name: string;
    
    location: string;

    @IsNotEmpty()
    date: string;

    @IsOptional()
    profilePicture: string;
}
