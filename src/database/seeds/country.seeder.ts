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
  { CountryName: 'Antigua and Barbuda', currency: 'East Caribbean Dollar (XCD)' },
  { CountryName: 'Argentina', currency: 'Argentine Peso (ARS)' },
  { CountryName: 'Armenia', currency: 'Armenian Dram (AMD)' },
  { CountryName: 'Australia', currency: 'Australian Dollar (AUD)' },
  { CountryName: 'Austria', currency: 'Euro (EUR)' },
  { CountryName: 'Azerbaijan', currency: 'Azerbaijani Manat (AZN)' },
  { CountryName: 'Bahamas', currency: 'Bahamian Dollar (BSD)' },
  { CountryName: 'Bahrain', currency: 'Bahraini Dinar (BHD)' },
  { CountryName: 'Bangladesh', currency: 'Bangladeshi Taka (BDT)' },
  { CountryName: 'Barbados', currency: 'Barbadian Dollar (BBD)' },
  { CountryName: 'Belarus', currency: 'Belarusian Ruble (BYN)' },
  { CountryName: 'Belgium', currency: 'Euro (EUR)' },
  { CountryName: 'Belize', currency: 'Belize Dollar (BZD)' },
  { CountryName: 'Benin', currency: 'West African CFA Franc (XOF)' },
  { CountryName: 'Bhutan', currency: 'Bhutanese Ngultrum (BTN)' },
  { CountryName: 'Bolivia', currency: 'Bolivian Boliviano (BOB)' },
  { CountryName: 'Bosnia and Herzegovina', currency: 'Convertible Mark (BAM)' },
  { CountryName: 'Botswana', currency: 'Botswana Pula (BWP)' },
  { CountryName: 'Brazil', currency: 'Brazilian Real (BRL)' },
  { CountryName: 'Brunei', currency: 'Brunei Dollar (BND)' },
  { CountryName: 'Bulgaria', currency: 'Bulgarian Lev (BGN)' },
  { CountryName: 'Burkina Faso', currency: 'West African CFA Franc (XOF)' },
  { CountryName: 'Burundi', currency: 'Burundian Franc (BIF)' },
  { CountryName: 'Cabo Verde', currency: 'Cape Verdean Escudo (CVE)' },
  { CountryName: 'Cambodia', currency: 'Cambodian Riel (KHR)' },
  { CountryName: 'Cameroon', currency: 'Central African CFA Franc (XAF)' },
  { CountryName: 'Canada', currency: 'Canadian Dollar (CAD)' },
  { CountryName: 'Central African Republic', currency: 'Central African CFA Franc (XAF)' },
  { CountryName: 'Chad', currency: 'Central African CFA Franc (XAF)' },
  { CountryName: 'Chile', currency: 'Chilean Peso (CLP)' },
  { CountryName: 'China', currency: 'Chinese Yuan (CNY)' },
  { CountryName: 'Colombia', currency: 'Colombian Peso (COP)' },
  { CountryName: 'Comoros', currency: 'Comorian Franc (KMF)' },
  { CountryName: 'Congo (Congo-Brazzaville)', currency: 'Central African CFA Franc (XAF)' },
  { CountryName: 'Costa Rica', currency: 'Costa Rican Colón (CRC)' },
  { CountryName: 'Croatia', currency: 'Euro (EUR)' },
  { CountryName: 'Cuba', currency: 'Cuban Peso (CUP)' },
  { CountryName: 'Cyprus', currency: 'Euro (EUR)' },
  { CountryName: 'Czech Republic (Czechia)', currency: 'Czech Koruna (CZK)' },
  { CountryName: 'Denmark', currency: 'Danish Krone (DKK)' },
  { CountryName: 'Djibouti', currency: 'Djiboutian Franc (DJF)' },
  { CountryName: 'Dominica', currency: 'East Caribbean Dollar (XCD)' },
  { CountryName: 'Dominican Republic', currency: 'Dominican Peso (DOP)' },
  { CountryName: 'Ecuador', currency: 'US Dollar (USD)' },
  { CountryName: 'Egypt', currency: 'Egyptian Pound (EGP)' },
  { CountryName: 'El Salvador', currency: 'US Dollar (USD)' },
  { CountryName: 'Equatorial Guinea', currency: 'Central African CFA Franc (XAF)' },
  { CountryName: 'Eritrea', currency: 'Eritrean Nakfa (ERN)' },
  { CountryName: 'Estonia', currency: 'Euro (EUR)' },
  { CountryName: 'Eswatini (fmr. "Swaziland")', currency: 'Swazi Lilangeni (SZL)' },
  { CountryName: 'Ethiopia', currency: 'Ethiopian Birr (ETB)' },
  { CountryName: 'Fiji', currency: 'Fijian Dollar (FJD)' },
  { CountryName: 'Finland', currency: 'Euro (EUR)' },
  { CountryName: 'France', currency: 'Euro (EUR)' },
  { CountryName: 'Gabon', currency: 'Central African CFA Franc (XAF)' },
  { CountryName: 'Gambia', currency: 'Gambian Dalasi (GMD)' },
  { CountryName: 'Georgia', currency: 'Georgian Lari (GEL)' },
  { CountryName: 'Germany', currency: 'Euro (EUR)' },
  { CountryName: 'Ghana', currency: 'Ghanaian Cedi (GHS)' },
  { CountryName: 'Greece', currency: 'Euro (EUR)' },
  { CountryName: 'Grenada', currency: 'East Caribbean Dollar (XCD)' },
  { CountryName: 'Guatemala', currency: 'Guatemalan Quetzal (GTQ)' },
  { CountryName: 'Guinea', currency: 'Guinean Franc (GNF)' },
  { CountryName: 'Guinea-Bissau', currency: 'West African CFA Franc (XOF)' },
  { CountryName: 'Guyana', currency: 'Guyanese Dollar (GYD)' },
  { CountryName: 'Haiti', currency: 'Haitian Gourde (HTG)' },
  { CountryName: 'Honduras', currency: 'Honduran Lempira (HNL)' },
  { CountryName: 'Hungary', currency: 'Hungarian Forint (HUF)' },
  { CountryName: 'Iceland', currency: 'Icelandic Króna (ISK)' },
  { CountryName: 'India', currency: 'Indian Rupee (INR)' },
  { CountryName: 'Indonesia', currency: 'Indonesian Rupiah (IDR)' },
  { CountryName: 'Iran', currency: 'Iranian Rial (IRR)' },
  { CountryName: 'Iraq', currency: 'Iraqi Dinar (IQD)' },
  { CountryName: 'Ireland', currency: 'Euro (EUR)' },
  { CountryName: 'Israel', currency: 'Israeli New Shekel (ILS)' },
  { CountryName: 'Italy', currency: 'Euro (EUR)' },
  { CountryName: 'Jamaica', currency: 'Jamaican Dollar (JMD)' },
  { CountryName: 'Japan', currency: 'Japanese Yen (JPY)' },
  { CountryName: 'Jordan', currency: 'Jordanian Dinar (JOD)' },
  { CountryName: 'Kazakhstan', currency: 'Kazakhstani Tenge (KZT)' },
  { CountryName: 'Kenya', currency: 'Kenyan Shilling (KES)' },
  { CountryName: 'Kiribati', currency: 'Australian Dollar (AUD)' },
  { CountryName: 'Kuwait', currency: 'Kuwaiti Dinar (KWD)' },
  { CountryName: 'Kyrgyzstan', currency: 'Kyrgyzstani Som (KGS)' },
  { CountryName: 'Laos', currency: 'Lao Kip (LAK)' },
  { CountryName: 'Latvia', currency: 'Euro (EUR)' },
  { CountryName: 'Lebanon', currency: 'Lebanese Pound (LBP)' },
  { CountryName: 'Lesotho', currency: 'Lesotho Loti (LSL)' },
  { CountryName: 'Liberia', currency: 'Liberian Dollar (LRD)' },
  { CountryName: 'Libya', currency: 'Libyan Dinar (LYD)' },
  { CountryName: 'Liechtenstein', currency: 'Swiss Franc (CHF)' },
  { CountryName: 'Lithuania', currency: 'Euro (EUR)' },
  { CountryName: 'Luxembourg', currency: 'Euro (EUR)' },
  { CountryName: 'Madagascar', currency: 'Malagasy Ariary (MGA)' },
  { CountryName: 'Malawi', currency: 'Malawian Kwacha (MWK)' },
  { CountryName: 'Malaysia', currency: 'Malaysian Ringgit (MYR)' },
  { CountryName: 'Maldives', currency: 'Maldivian Rufiyaa (MVR)' },
  { CountryName: 'Mali', currency: 'West African CFA Franc (XOF)' },
  { CountryName: 'Malta', currency: 'Euro (EUR)' },
  { CountryName: 'Marshall Islands', currency: 'US Dollar (USD)' },
  { CountryName: 'Mauritania', currency: 'Mauritanian Ouguiya (MRU)' },
  { CountryName: 'Mauritius', currency: 'Mauritian Rupee (MUR)' },
  { CountryName: 'Mexico', currency: 'Mexican Peso (MXN)' },
  { CountryName: 'Micronesia', currency: 'US Dollar (USD)' },
  { CountryName: 'Moldova', currency: 'Moldovan Leu (MDL)' },
  { CountryName: 'Monaco', currency: 'Euro (EUR)' },
  { CountryName: 'Mongolia', currency: 'Mongolian Tögrög (MNT)' },
  { CountryName: 'Montenegro', currency: 'Euro (EUR)' },
  { CountryName: 'Morocco', currency: 'Moroccan Dirham (MAD)' },
  { CountryName: 'Mozambique', currency: 'Mozambican Metical (MZN)' },
  { CountryName: 'Myanmar (Burma)', currency: 'Myanmar Kyat (MMK)' },
  { CountryName: 'Namibia', currency: 'Namibian Dollar (NAD)' }, 
  { CountryName: 'Nauru', currency: 'Australian Dollar (AUD)' }, 
  { CountryName: 'Nepal', currency: 'Nepalese Rupee (NPR)' }, 
  { CountryName: 'Netherlands', currency: 'Euro (EUR)' }, 
  { CountryName: 'New Zealand', currency: 'New Zealand Dollar (NZD)' },
   { CountryName: 'Nicaragua', currency: 'Nicaraguan Córdoba (NIO)' }, 
   { CountryName: 'Niger', currency: 'West African CFA Franc (XOF)' }, 
   { CountryName: 'Nigeria', currency: 'Nigerian Naira (NGN)' }, 
   { CountryName: 'North Korea', currency: 'North Korean Won (KPW)' },
    { CountryName: 'North Macedonia', currency: 'Macedonian Denar (MKD)' }, 
    { CountryName: 'Norway', currency: 'Norwegian Krone (NOK)' }, { CountryName: 'Oman', currency: 'Omani Rial (OMR)' }, { CountryName: 'Pakistan', currency: 'Pakistani Rupee (PKR)' }, { CountryName: 'Palau', currency: 'US Dollar (USD)' }, { CountryName: 'Palestine', currency: 'Israeli New Shekel (ILS)' }, { CountryName: 'Panama', currency: 'Panamanian Balboa (PAB)' }, { CountryName: 'Papua New Guinea', currency: 'Papua New Guinean Kina (PGK)' }, { CountryName: 'Paraguay', currency: 'Paraguayan Guarani (PYG)' }, { CountryName: 'Peru', currency: 'Peruvian Sol (PEN)' }, { CountryName: 'Philippines', currency: 'Philippine Peso (PHP)' }, { CountryName: 'Poland', currency: 'Polish Złoty (PLN)' }, { CountryName: 'Portugal', currency: 'Euro (EUR)' }, { CountryName: 'Qatar', currency: 'Qatari Riyal (QAR)' }, { CountryName: 'Romania', currency: 'Romanian Leu (RON)' }, { CountryName: 'Russia', currency: 'Russian Ruble (RUB)' }, { CountryName: 'Rwanda', currency: 'Rwandan Franc (RWF)' }, { CountryName: 'Saint Kitts and Nevis', currency: 'East Caribbean Dollar (XCD)' }, { CountryName: 'Saint Lucia', currency: 'East Caribbean Dollar (XCD)' }, { CountryName: 'Saint Vincent and the Grenadines', currency: 'East Caribbean Dollar (XCD)' }, { CountryName: 'Samoa', currency: 'Samoan Tala (WST)' }, { CountryName: 'San Marino', currency: 'Euro (EUR)' }, { CountryName: 'Sao Tome and Principe', currency: 'São Tomé and Príncipe Dobra (STN)' }, { CountryName: 'Saudi Arabia', currency: 'Saudi Riyal (SAR)' }, { CountryName: 'Senegal', currency: 'West African CFA Franc (XOF)' }, { CountryName: 'Serbia', currency: 'Serbian Dinar (RSD)' }, { CountryName: 'Seychelles', currency: 'Seychellois Rupee (SCR)' }, { CountryName: 'Sierra Leone', currency: 'Sierra Leonean Leone (SLE)' }, { CountryName: 'Singapore', currency: 'Singapore Dollar (SGD)' }, { CountryName: 'Slovakia', currency: 'Euro (EUR)' }, { CountryName: 'Slovenia', currency: 'Euro (EUR)' }, { CountryName: 'Solomon Islands', currency: 'Solomon Islands Dollar (SBD)' }, { CountryName: 'Somalia', currency: 'Somali Shilling (SOS)' }, { CountryName: 'South Africa', currency: 'South African Rand (ZAR)' }, { CountryName: 'South Korea', currency: 'South Korean Won (KRW)' }, { CountryName: 'South Sudan', currency: 'South Sudanese Pound (SSP)' }, { CountryName: 'Spain', currency: 'Euro (EUR)' }, { CountryName: 'Sri Lanka', currency: 'Sri Lankan Rupee (LKR)' }, { CountryName: 'Sudan', currency: 'Sudanese Pound (SDG)' }, { CountryName: 'Suriname', currency: 'Surinamese Dollar (SRD)' }, { CountryName: 'Sweden', currency: 'Swedish Krona (SEK)' }, { CountryName: 'Switzerland', currency: 'Swiss Franc (CHF)' }, { CountryName: 'Syria', currency: 'Syrian Pound (SYP)' }, { CountryName: 'Taiwan', currency: 'New Taiwan Dollar (TWD)' }, { CountryName: 'Tajikistan', currency: 'Tajikistani Somoni (TJS)' }, { CountryName: 'Tanzania', currency: 'Tanzanian Shilling (TZS)' }, { CountryName: 'Thailand', currency: 'Thai Baht (THB)' }, { CountryName: 'Timor-Leste', currency: 'US Dollar (USD)' }, { CountryName: 'Togo', currency: 'West African CFA Franc (XOF)' }, { CountryName: 'Tonga', currency: 'Tongan Paʻanga (TOP)' }, { CountryName: 'Trinidad and Tobago', currency: 'Trinidad and Tobago Dollar (TTD)' }, { CountryName: 'Tunisia', currency: 'Tunisian Dinar (TND)' }, { CountryName: 'Turkey', currency: 'Turkish Lira (TRY)' }, { CountryName: 'Turkmenistan', currency: 'Turkmenistani Manat (TMT)' }, { CountryName: 'Tuvalu', currency: 'Australian Dollar (AUD)' }, { CountryName: 'Uganda', currency: 'Ugandan Shilling (UGX)' }, { CountryName: 'Ukraine', currency: 'Ukrainian Hryvnia (UAH)' }, { CountryName: 'United Arab Emirates', currency: 'UAE Dirham (AED)' }, { CountryName: 'United Kingdom', currency: 'British Pound Sterling (GBP)' }, { CountryName: 'United States', currency: 'US Dollar (USD)' }, { CountryName: 'Uruguay', currency: 'Uruguayan Peso (UYU)' }, { CountryName: 'Uzbekistan', currency: 'Uzbekistani Som (UZS)' }, { CountryName: 'Vanuatu', currency: 'Vanuatu Vatu (VUV)' }, { CountryName: 'Vatican City', currency: 'Euro (EUR)' }, { CountryName: 'Venezuela', currency: 'Venezuelan Bolívar Soberano (VES)' }, { CountryName: 'Vietnam', currency: 'Vietnamese Đồng (VND)' }, { CountryName: 'Yemen', currency: 'Yemeni Rial (YER)' }, { CountryName: 'Zambia', currency: 'Zambian Kwacha (ZMW)' }, { CountryName: 'Zimbabwe', currency: 'Zimbabwean Dollar (ZWL)' },];

@Injectable()
export class CountriesSeederService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    private readonly logger: Logger
  ) { }

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