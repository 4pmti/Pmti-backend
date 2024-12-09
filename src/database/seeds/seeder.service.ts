import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { CountriesSeederService } from './country.seeder';

@Injectable()
export class Seeder {
  constructor(
    private readonly logger: Logger,
    private readonly countriesSeederService: CountriesSeederService
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
