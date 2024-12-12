import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { User } from 'src/user/entities/user.entity';
import { CountryService } from '../country/country.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Role } from 'src/common/enums/role';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private readonly countryService: CountryService,
  ) { }

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

  async findAll() {
    try {
      return await this.locationRepository.find();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(userId: string, id: number, updateLocationDto: UpdateLocationDto) {

    try {
      const user = await this.userRepository.findOne({
        where: {
          id: userId
        }
      });
      if (!user) {
        throw new UnauthorizedException("Invalid User");
      }
      if (user.role != Role.ADMIN) {
        throw new ForbiddenException("You don't have this permission!");
      }
      const location = await this.locationRepository.findOne({
        where: {
          id: id
        }
      });
      if (!location) {
        throw new NotFoundException("Location Not Found");
      }

      Object.assign(location, updateLocationDto);
      return await this.locationRepository.save(location);


    } catch (error) {
      console.log(error);
      throw error;
    }

  }
}