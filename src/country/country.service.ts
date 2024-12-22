import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { User } from 'src/user/entities/user.entity';
import { isAdmin } from 'src/common/util/utilities';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>
  ) { }

  create(createCountryDto: CreateCountryDto) {
    return this.countryRepository.save(createCountryDto);
  }

  async findAll() {
    return await this.countryRepository.find(
      {
        relations: ['locations']
      }
    );
  }

  findOne(id: number) {
    return this.countryRepository.findOne({ where: { id } });
  }

  async removeBulk(ids: number[], userId: string) {
    try {
      if (!isAdmin(userId, this.userRepository)) {
        throw new UnauthorizedException('You Dont have permission to perform this action');
      }
      return await this.countryRepository.delete(ids);

    } catch (error) {
      console.log(error);
    }
  }



  update(id: number, updateCountryDto: UpdateCountryDto) {

    return this.countryRepository.update(id, updateCountryDto);
  }

  remove(id: number) {
    return this.countryRepository.delete(id);
  }
}
