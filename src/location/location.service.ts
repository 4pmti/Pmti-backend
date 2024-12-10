import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { User } from 'src/user/entities/user.entity';
import { CountryService } from '../country/country.service';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private readonly countryService: CountryService,
  ) {}

  async create(userId: string, createLocationDto: CreateLocationDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });
      
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const country = await this.countryService.findOne(createLocationDto.country);

      if (!country) {
        throw new NotFoundException('Country not found');
      }

      const location = new Location();
      location.location = createLocationDto.location;
      location.country = Promise.resolve(country);
      location.addedBy = userId;
      location.updatedBy = userId;
      return await this.locationRepository.save(location);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}