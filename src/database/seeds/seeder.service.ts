import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { CountriesSeederService } from './country.seeder';
import { CategorySeeder } from './course.category.seeder';
import { StatesSeederService } from './state.seeder';
import { ReviewSeederService } from './review.seeder';
import { LocationSeederService } from './location.seeder';
import { NearbyLocationSeederService } from './nearby-location.seeder';

@Injectable()
export class Seeder {
  constructor(
    private readonly logger: Logger,
    private readonly countriesSeederService: CountriesSeederService,
    private readonly CateforySeederService: CategorySeeder,
    private readonly stateSeederService: StatesSeederService,
    private readonly reviewSeederService: ReviewSeederService,
    private readonly locationSeederService: LocationSeederService,
    private readonly nearbyLocationSeederService: NearbyLocationSeederService,
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

      await this.states().then(
        completed =>{
          this.logger.debug('Successfully completed seeding states...');
          Promise.resolve(completed);
        }
      )
      .catch(error => {
        this.logger.error('Failed seeding states...');
        Promise.reject(error);
      });

      await this.locations()
        .then(completed => {
          this.logger.debug('Successfully completed seeding locations...');
          Promise.resolve(completed);
        })
        .catch(error => {
          this.logger.error('Failed seeding locations...');
          Promise.reject(error);
        });

      await this.nearbyLocations()
        .then(completed => {
          this.logger.debug('Successfully completed seeding nearby locations...');
          Promise.resolve(completed);
        })
        .catch(error => {
          this.logger.error('Failed seeding nearby locations...');
          Promise.reject(error);
        });

    await this.reviews()
      .then(completed => {
        this.logger.debug('Successfully completed seeding reviews...');
        Promise.resolve(completed);
      })
      .catch(error => {
        this.logger.error('Failed seeding reviews...');
        this.logger.error(error);
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

  async states() {
    return await this.stateSeederService
      .seed()
      .then(createdStates => {
        this.logger.debug(
          'No. of states created : ' +
          createdStates,
        );
        return Promise.resolve(true);
      })
      .catch(error => Promise.reject(error));
  }

  async locations() {
    return await this.locationSeederService
      .seed()
      .then(createdLocations => {
        this.logger.debug(
          'No. of locations created : ' +
          createdLocations,
        );
        return Promise.resolve(true);
      })
      .catch(error => Promise.reject(error));
  }

  async reviews() {
    return await this.reviewSeederService
      .seed()
      .then(createdReviews => {
        this.logger.debug(
          'No. of reviews created : ' +
          createdReviews,
        );
        return Promise.resolve(true);
      })
      .catch(error => Promise.reject(error));
  }

  async nearbyLocations() {
    return await this.nearbyLocationSeederService
      .seed()
      .then(updatedLocations => {
        this.logger.debug(
          'No. of nearby locations updated : ' +
          updatedLocations,
        );
        return Promise.resolve(true);
      })
      .catch(error => Promise.reject(error));
  }
}
