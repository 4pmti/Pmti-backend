import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from 'src/reviews/entities/review.entity';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

@Injectable()
export class ReviewSeederService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async seed(): Promise<number> {
    const reviews: Partial<Review>[] = [];
    const csvFilePath = path.resolve(__dirname, '../../../all_reviews.csv');

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          const rating = row.Rating && !isNaN(Number(row.Rating)) ? Number(row.Rating) : null;
          reviews.push({
            category: row.Category,
            name: row.Name,
            date: row.Date??'',
            location: row.Location??'',
            rating,
            review: row.Review,
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    await this.reviewRepository.save(reviews);
    return reviews.length;
  }
}