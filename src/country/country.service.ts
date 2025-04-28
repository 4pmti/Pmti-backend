import { Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
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

  async create(createCountryDto: CreateCountryDto) {
    try{
    return await this.countryRepository.save(createCountryDto);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Something went wrong.," + error);
    }
  }

  async findAll() {
    try{
    const countries = await this.countryRepository.find({
     relations : {
      locations : true,
      states : true
     }
    });
    console.log(countries);
  
   return countries;
  } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Something went wrong.," + error);
    }
  }


  findOne(id: number) {
    try{
    return this.countryRepository.findOne({ where: { id } });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Something went wrong.," + error);
    }
  }

  async removeBulk(ids: number[], userId: string) {
    try {
      if (!await isAdmin(userId, this.userRepository)) {
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
