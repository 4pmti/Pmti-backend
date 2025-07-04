import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from 'src/location/entities/location.entity';
import { State } from 'src/state/entities/state.entity';
import { Country } from 'src/country/entities/country.entity';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocationSeederService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    private readonly logger: Logger,
  ) {}

  // Mapping of state abbreviations to full state names
  private readonly stateAbbreviationMap: { [key: string]: string } = {
    'AL': 'Alabama',
    'AK': 'Alaska',
    'AZ': 'Arizona',
    'AR': 'Arkansas',
    'CA': 'California',
    'CO': 'Colorado',
    'CT': 'Connecticut',
    'DE': 'Delaware',
    'FL': 'Florida',
    'GA': 'Georgia',
    'HI': 'Hawaii',
    'Hi': 'Hawaii', // Handle case variation in CSV
    'ID': 'Idaho',
    'IL': 'Illinois',
    'IN': 'Indiana',
    'IA': 'Iowa',
    'KS': 'Kansas',
    'KY': 'Kentucky',
    'LA': 'Louisiana',
    'ME': 'Maine',
    'MD': 'Maryland',
    'MA': 'Massachusetts',
    'MI': 'Michigan',
    'MN': 'Minnesota',
    'MS': 'Mississippi',
    'MO': 'Missouri',
    'MT': 'Montana',
    'NE': 'Nebraska',
    'NV': 'Nevada',
    'NH': 'New Hampshire',
    'NJ': 'New Jersey',
    'NM': 'New Mexico',
    'NY': 'New York',
    'NC': 'North Carolina',
    'ND': 'North Dakota',
    'OH': 'Ohio',
    'OK': 'Oklahoma',
    'OR': 'Oregon',
    'PA': 'Pennsylvania',
    'RI': 'Rhode Island',
    'SC': 'South Carolina',
    'SD': 'South Dakota',
    'TN': 'Tennessee',
    'TX': 'Texas',
    'UT': 'Utah',
    'VT': 'Vermont',
    'VA': 'Virginia',
    'WA': 'Washington',
    'WV': 'West Virginia',
    'WI': 'Wisconsin',
    'WY': 'Wyoming',
    'DC': 'District of Columbia'
  };

  async seed(): Promise<number> {
    try {
      // Get US country (id: 52)
      const usCountry:Country = await this.countryRepository.findOne({
        where: { id: 52 }
      });

      if (!usCountry) {
        this.logger.error('US Country with id 52 not found. Please ensure countries are seeded first.');
        return 0;
      }

      // Read CSV file
      const csvPath = path.join(process.cwd(), 'src/database/data/nearby locations work sheet.csv');
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n').slice(1); // Skip header

      let createdCount = 0;
      const locationsToInsert:Location[] = [];

      for (const line of lines) {
        if (!line.trim()) continue; // Skip empty lines

        const [locationIdStr, name] = line.split(',');
        const locationId = parseInt(locationIdStr?.trim());
        const locationName = name?.trim();

        if (!locationId || !locationName) {
          this.logger.warn(`Skipping invalid line: ${line}`);
          continue;
        }

        // Skip special entries like "Live e-learning" and "Online"
        if (locationName === 'Live e-learning' || locationName === 'Online') {
          this.logger.debug(`Skipping special location: ${locationName}`);
          continue;
        }

        // Extract state abbreviation from location name like "Columbus (OH)"
        const stateMatch = locationName.match(/\(([A-Z][A-Za-z]?)\)$/);
        if (!stateMatch) {
          this.logger.warn(`Could not extract state from location: ${locationName}`);
          continue;
        }

        const stateAbbr = stateMatch[1];
        const fullStateName = this.stateAbbreviationMap[stateAbbr];

        if (!fullStateName) {
          this.logger.warn(`Unknown state abbreviation: ${stateAbbr} for location: ${locationName}`);
          continue;
        }

        // Find the state in database
        const state:State = await this.stateRepository.findOne({
          where: { 
            name: fullStateName,
            country: { id: usCountry.id }
          }
        });

        if (!state) {
          this.logger.warn(`State ${fullStateName} not found in database for location: ${locationName}`);
          continue;
        }

        // Check if location already exists
        const existingLocation = await this.locationRepository.findOne({
          where: { id: locationId }
        });

        if (existingLocation) {
          this.logger.debug(`Location with id ${locationId} already exists: ${locationName}`);
          continue;
        }

        // Extract city name (remove state abbreviation part)
        const cityName = locationName.replace(/\s*\([A-Z][A-Za-z]?\)$/, '');

        // Prepare location data for individual save
        const locationData = new Location();
        locationData.id = locationId;
        locationData.location = locationName;
        locationData.country = Promise.resolve(usCountry); // Keep Promise.resolve for lazy relationship
        locationData.state = state;
        locationData.addedBy = '';
        locationData.updatedBy = '';
        locationData.isDelete = false;
        locationData.nearbyLocations = '';
        locationData.createdAt = new Date();
        locationData.updatedAt = new Date();

        locationsToInsert.push(locationData);
        this.logger.debug(`Prepared location: ${cityName} in ${fullStateName} with id ${locationId}`);
      }

      // Save all locations individually
      if (locationsToInsert.length > 0) {
        for (const location of locationsToInsert) {
          await this.locationRepository.save(location);
          createdCount++;
        }
      }

      this.logger.log(`Successfully created ${createdCount} locations`);
      return createdCount;

    } catch (error) {
      this.logger.error('Error seeding locations:', error);
      throw error;
    }
  }
} 