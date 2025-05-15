import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { reviewCategory } from 'src/common/enums/enums';
@Injectable()
export class ReviewsService {
   
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  
  async create(createReviewDto: CreateReviewDto) {
    try {
      const review = this.reviewRepository.create(createReviewDto);
      return await this.reviewRepository.save(review);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(category: reviewCategory) {
   try{
    if(category){
      return await this.reviewRepository.find({where: {category}});
    }
    return await this.reviewRepository.find();
  }catch(error){
    throw new HttpException(error, HttpStatus.BAD_REQUEST);
  }
  }


  async update(id: number, updateReviewDto: UpdateReviewDto) {
    try{
      const review = await this.reviewRepository.findOne({where: {id}});
      if(!review){
        throw new HttpException('Review not found', HttpStatus.NOT_FOUND);
      }
      return await this.reviewRepository.update(id, updateReviewDto);
    } catch(e){
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} review`;
  }
}
