import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { User } from 'src/user/entities/user.entity';
import { CountryService } from '../country/country.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Role } from 'src/common/enums/role';
import { State } from 'src/state/entities/state.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
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

      const state = await this.stateRepository.findOne({
        where : {
          id : createLocationDto.state
        }
      });

      if (!state) {
        throw new NotFoundException('State not found');
      }


      

      const location = new Location();
      location.location = createLocationDto.location;
      location.country = Promise.resolve(country);
      location.addedBy = userId;
      location.updatedBy = userId;
      location.state = state;
      return await this.locationRepository.save(location);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.locationRepository.find(
        {
          relations : {
            country : true,
            state : true
          }
        }
      );
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
      if (!user.roles.includes(Role.ADMIN)) {
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