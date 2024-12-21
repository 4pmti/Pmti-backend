import { forwardRef, Module } from '@nestjs/common';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';
import { LocationModule } from 'src/location/location.module';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Country,User]),
    forwardRef(() => LocationModule),
    AuthModule,
  ],
  controllers: [CountryController],
  providers: [CountryService,AuthModule],
  exports: [CountryService]
})
export class CountryModule {}