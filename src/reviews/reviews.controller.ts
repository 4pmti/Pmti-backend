import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { reviewCategory } from 'src/common/enums/enums';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Get()
  @ApiOperation({ summary: 'List reviews by category' })
  @ApiQuery({ name: 'category', enum: reviewCategory, required: false, description: 'Filter by review source' })
  @ApiResponse({ status: 200, description: 'List of reviews' })
  findAll(
    @Query('category') category: reviewCategory
  ) {
    return this.reviewsService.findAll(category);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a review by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(+id, updateReviewDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(+id);
  }
}
