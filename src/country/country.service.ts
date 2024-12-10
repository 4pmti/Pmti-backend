import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>
  ) {}
  
  create(createCountryDto: CreateCountryDto) {
    return this.countryRepository.save(createCountryDto);
  }

  findAll() {
    return this.countryRepository.find();
  }

  findOne(id: number) {
    return this.countryRepository.findOne({ where: { id } });
  }

  update(id: number, updateCountryDto: UpdateCountryDto) {
    return this.countryRepository.update(id, updateCountryDto);
  }

  remove(id: number) {
    return this.countryRepository.delete(id);
  }
}
