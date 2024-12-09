import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { Seeder } from './seeder.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  try {
    const appContext = await NestFactory.createApplicationContext(SeederModule);
    const logger = appContext.get(Logger);
    const seeder = appContext.get(Seeder);
    
    try {
      await seeder.seed();
      logger.debug('Seeding complete!');
    } catch (error) {
      logger.error('Seeding failed!');
      logger.error(error);
    } finally {
      await appContext.close();
    }
  } catch (error) {
    console.error('Failed to initialize application context', error);
    process.exit(1);
  }
}

bootstrap();
