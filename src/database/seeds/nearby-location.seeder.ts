import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from 'src/location/entities/location.entity';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NearbyLocationSeederService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private readonly logger: Logger,
  ) {}

  async seed(): Promise<number> {
    try {
      // Read CSV file
      const csvPath = path.join(process.cwd(), 'src/database/data/nearby.csv');
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n').slice(1); // Skip header

      let updatedCount = 0;

      for (const line of lines) {
        if (!line.trim()) continue; // Skip empty lines

        const columns = line.split(',');
        
        // Skip if first column (location ID) is empty
        if (!columns[0] || !columns[0].trim()) continue;

        const locationId = parseInt(columns[0].trim());
        const locationName = columns[1]?.trim();

        if (!locationId) {
          this.logger.warn(`Invalid location ID in line: ${line}`);
          continue;
        }

        // Find the location to update
        const location = await this.locationRepository.findOne({
          where: { id: locationId }
        });

        if (!location) {
          this.logger.warn(`Location with ID ${locationId} not found: ${locationName}`);
          continue;
        }

        // Collect nearby location IDs from columns 2+ (starting from index 2)
        const nearbyLocationIds: string[] = [];
        
        for (let i = 2; i < columns.length; i++) {
          const nearbyId = columns[i]?.trim();
          if (nearbyId && !isNaN(parseInt(nearbyId))) {
            nearbyLocationIds.push(nearbyId);
          }
        }

        // Update the nearbyLocations field with comma-separated IDs
        const nearbyLocationsString = nearbyLocationIds.join(',');
        
        if (nearbyLocationsString !== location.nearbyLocations) {
          location.nearbyLocations = nearbyLocationsString;
          await this.locationRepository.save(location);
          
          this.logger.debug(`Updated nearby locations for ${locationName} (ID: ${locationId}): ${nearbyLocationsString}`);
          updatedCount++;
        } else {
          this.logger.debug(`No changes needed for ${locationName} (ID: ${locationId})`);
        }
      }

      this.logger.log(`Successfully updated nearby locations for ${updatedCount} locations`);
      return updatedCount;

    } catch (error) {
      this.logger.error('Error seeding nearby locations:', error);
      throw error;
    }
  }
} 