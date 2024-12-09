import { Country } from 'src/country/entities/country.entity';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';


export const countries = [
  { CountryName: 'Afghanistan', currency: 'Afghan Afghani (AFN)' },
  { CountryName: 'Albania', currency: 'Albanian Lek (ALL)' },
  { CountryName: 'Algeria', currency: 'Algerian Dinar (DZD)' },
  { CountryName: 'Andorra', currency: 'Euro (EUR)' },
  { CountryName: 'Angola', currency: 'Angolan Kwanza (AOA)' },
  { CountryName: 'Argentina', currency: 'Argentine Peso (ARS)' },
  { CountryName: 'Australia', currency: 'Australian Dollar (AUD)' },
  { CountryName: 'Austria', currency: 'Euro (EUR)' },
  { CountryName: 'Bahamas', currency: 'Bahamian Dollar (BSD)' },
  { CountryName: 'Bahrain', currency: 'Bahraini Dinar (BHD)' },
  { CountryName: 'Bangladesh', currency: 'Bangladeshi Taka (BDT)' },
  { CountryName: 'Belgium', currency: 'Euro (EUR)' },
  { CountryName: 'Brazil', currency: 'Brazilian Real (BRL)' },
  { CountryName: 'Canada', currency: 'Canadian Dollar (CAD)' },
  { CountryName: 'China', currency: 'Chinese Yuan (CNY)' },
  { CountryName: 'Denmark', currency: 'Danish Krone (DKK)' },
  { CountryName: 'Egypt', currency: 'Egyptian Pound (EGP)' },
  { CountryName: 'France', currency: 'Euro (EUR)' },
  { CountryName: 'Germany', currency: 'Euro (EUR)' },
  { CountryName: 'Greece', currency: 'Euro (EUR)' },
  { CountryName: 'India', currency: 'Indian Rupee (INR)' },
  { CountryName: 'Indonesia', currency: 'Indonesian Rupiah (IDR)' },
  { CountryName: 'Iran', currency: 'Iranian Rial (IRR)' },
  { CountryName: 'Iraq', currency: 'Iraqi Dinar (IQD)' },
  { CountryName: 'Ireland', currency: 'Euro (EUR)' },
  { CountryName: 'Israel', currency: 'Israeli New Shekel (ILS)' },
  { CountryName: 'Italy', currency: 'Euro (EUR)' },
  { CountryName: 'Japan', currency: 'Japanese Yen (JPY)' },
  { CountryName: 'Kuwait', currency: 'Kuwaiti Dinar (KWD)' },
  { CountryName: 'Malaysia', currency: 'Malaysian Ringgit (MYR)' },
  { CountryName: 'Mexico', currency: 'Mexican Peso (MXN)' },
  { CountryName: 'Netherlands', currency: 'Euro (EUR)' },
  { CountryName: 'New Zealand', currency: 'New Zealand Dollar (NZD)' },
  { CountryName: 'Norway', currency: 'Norwegian Krone (NOK)' },
  { CountryName: 'Pakistan', currency: 'Pakistani Rupee (PKR)' },
  { CountryName: 'Philippines', currency: 'Philippine Peso (PHP)' },
  { CountryName: 'Poland', currency: 'Polish Złoty (PLN)' },
  { CountryName: 'Portugal', currency: 'Euro (EUR)' },
  { CountryName: 'Qatar', currency: 'Qatari Riyal (QAR)' },
  { CountryName: 'Russia', currency: 'Russian Ruble (RUB)' },
  { CountryName: 'Saudi Arabia', currency: 'Saudi Riyal (SAR)' },
  { CountryName: 'Singapore', currency: 'Singapore Dollar (SGD)' },
  { CountryName: 'South Africa', currency: 'South African Rand (ZAR)' },
  { CountryName: 'South Korea', currency: 'South Korean Won (KRW)' },
  { CountryName: 'Spain', currency: 'Euro (EUR)' },
  { CountryName: 'Sweden', currency: 'Swedish Krona (SEK)' },
  { CountryName: 'Switzerland', currency: 'Swiss Franc (CHF)' },
  { CountryName: 'Thailand', currency: 'Thai Baht (THB)' },
  { CountryName: 'Turkey', currency: 'Turkish Lira (TRY)' },
  { CountryName: 'United Arab Emirates', currency: 'UAE Dirham (AED)' },
  { CountryName: 'United Kingdom', currency: 'British Pound (GBP)' },
  { CountryName: 'United States', currency: 'US Dollar (USD)' },
  { CountryName: 'Vietnam', currency: 'Vietnamese Dong (VND)' }
];


@Injectable()
export class CountriesSeederService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    private readonly logger: Logger
  ) {}

  async create(): Promise<Country[]> {

    const countriesToAdd: Country[] = [];

    for (const countryData of countries) {
      const existingCountry = await this.countryRepository.findOne({
        where: { CountryName: countryData.CountryName }
      });

      if (!existingCountry) {
        const country = new Country();
        country.CountryName = countryData.CountryName;
        country.currency = countryData.currency;
        country.isActive = true;
        country.addedBy = 1; // default admin user
        countriesToAdd.push(country);
      } else {
        this.logger.debug(`Skipping ${countryData.CountryName} - already exists`);
      }
    }

    if (countriesToAdd.length > 0) {
      await this.countryRepository.save(countriesToAdd);
      this.logger.debug(`Added ${countriesToAdd.length} new countries`);
    }

    return countriesToAdd;
  }
}


// Usage example:
/*
async function runSeed() {
  const dataSource = new DataSource({
    // your database configuration
  });

  await dataSource.initialize();
  
  const seeder = new CountrySeeder(dataSource);
  await seeder.seed();
  
  // Optionally update currencies of existing countries
  // await seeder.updateExistingCurrencies();
  
  await dataSource.destroy();
}

runSeed().catch(console.error);
*/