import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './entities/review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BcryptService } from 'src/common/util/bcrypt.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Review]),
  JwtModule.register({
    secret: process.env.SECRET_KEY ?? "pmti",
    signOptions: { expiresIn: '6h' },
  }),],
  controllers: [ReviewsController],
  providers: [ReviewsService, BcryptService],
})
export class ReviewsModule { }
