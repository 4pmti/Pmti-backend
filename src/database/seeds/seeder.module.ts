import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Seeder } from './seeder.service';
import { CountriesSeederService } from './country.seeder';
import { Country } from '../../country/entities/country.entity';
import typeorm from '../../config/typeorm';
import { Logger } from '@nestjs/common';
import { CategorySeeder } from './course.category.seeder';
import { Category } from 'src/class/entities/category.entity';
import { StatesSeederService } from './state.seeder';
import { State } from 'src/state/entities/state.entity';
import { ReviewSeederService } from './review.seeder';
import { Review } from 'src/reviews/entities/review.entity';
import { LocationSeederService } from './location.seeder';
import { Location } from 'src/location/entities/location.entity';
import { NearbyLocationSeederService } from './nearby-location.seeder';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [typeorm]
    }),
    TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) =>
          configService.get('typeorm'),
        inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Country, Category, State, Review, Location])
  ],
  providers: [Logger, Seeder, CountriesSeederService, CategorySeeder, StatesSeederService, ReviewSeederService, LocationSeederService, NearbyLocationSeederService],
})
export class SeederModule {}