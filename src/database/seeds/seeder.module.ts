import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Seeder } from './seeder.service';
import { CountriesSeederService } from './country.seeder';
import { Country } from '../../country/entities/country.entity';
import typeorm from '../../config/typeorm';
import { Logger } from '@nestjs/common';

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
    TypeOrmModule.forFeature([Country])
  ],
  providers: [Logger, Seeder, CountriesSeederService],
})
export class SeederModule {}
