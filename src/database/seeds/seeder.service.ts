import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { CountriesSeederService } from './country.seeder';
import { CategorySeeder } from './course.category.seeder';

@Injectable()
export class Seeder {
  constructor(
    private readonly logger: Logger,
    private readonly countriesSeederService: CountriesSeederService,
    private readonly CateforySeederService: CategorySeeder
  ) {}

  async seed() {
    await this.countries()
      .then(completed => {
        this.logger.debug('Successfully completed seeding countries...');
        Promise.resolve(completed);
      })
      .catch(error => {
        this.logger.error('Failed seeding countries...');
        Promise.reject(error);
      });

    await this.categories()
       .then(completed=>{
        this.logger.debug('Successfully completed seeding categories...');
        Promise.resolve(completed);
       })
       .catch(error => {
        this.logger.error('Failed seeding categories...');
        Promise.reject(error);
      });
  }

  async categories() {
    return await this.CateforySeederService
      .seed()
      .then(createdCategories => {
        this.logger.debug(
          'No. of categories created : ' +
          createdCategories,
        );
        return Promise.resolve(true);
      })
      .catch(error => Promise.reject(error));
  }

  async countries() {
    return await this.countriesSeederService
      .create()
      .then(createdCountries => {
        this.logger.debug(
          'No. of countries created : ' +
          createdCountries.length,
        );
        return Promise.resolve(true);
      })
      .catch(error => Promise.reject(error));
  }
}
