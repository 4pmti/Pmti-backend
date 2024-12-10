import { forwardRef, Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Location } from './entities/location.entity';
import { CountryModule } from 'src/country/country.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Location, User]),
    AuthModule,
    forwardRef(() => CountryModule)
  ],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService]
})
export class LocationModule {}