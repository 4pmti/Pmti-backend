import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: 'development.env' });

const config = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  saltkey: process.env.SALT_KEY,
  saltRounds:process.env.SALT_ROUNDS,
  // entities: entities,
  entities: [
    join(__dirname,'/../**/*.entity{.ts,.js}'),
  ],
  //entities: ['dist/app.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: true,
  autoLoadEntities: true,
  ssl: process.env.SSL_MODE == 'false' || false ? false : true,
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
