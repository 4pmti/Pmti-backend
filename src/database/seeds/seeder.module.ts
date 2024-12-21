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
    TypeOrmModule.forFeature([Country, Category])
  ],
  providers: [Logger, Seeder, CountriesSeederService, CategorySeeder],
})
export class SeederModule {}