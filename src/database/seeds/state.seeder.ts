import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from 'src/state/entities/state.entity';
import { Country } from 'src/country/entities/country.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class StatesSeederService {
  constructor(
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    private readonly logger: Logger,
  ) {}

  async seed(): Promise<void> {
    const countriesWithStates = [
      {
        countryName: 'United States',
        states: [
          'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
          'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia',
          'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
          'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
          'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
          'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
          'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
          'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
          'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
          'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
        ],
      },
      {
        countryName: 'Canada',
        states: [
          'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
          'Newfoundland and Labrador', 'Nova Scotia', 'Ontario',
          'Prince Edward Island', 'Quebec', 'Saskatchewan',
        ],
      },
    ];

    for (const countryData of countriesWithStates) {
      const country = await this.countryRepository.findOne({
        where: { CountryName: countryData.countryName },
      });

      if (!country) {
        this.logger.warn(`Country ${countryData.countryName} not found. Skipping states.`);
        continue;
      }

      for (const stateName of countryData.states) {
        const existingState = await this.stateRepository.findOne({
          where: { name: stateName, country: { id: country.id } },
        });

        if (!existingState) {
          const state = new State();
          state.name = stateName;
          state.country = country;

          await this.stateRepository.save(state);
          this.logger.debug(`State ${stateName} added to country ${countryData.countryName}`);
        } else {
          this.logger.debug(`State ${stateName} already exists for country ${countryData.countryName}`);
        }
      }
    }
  }
}
