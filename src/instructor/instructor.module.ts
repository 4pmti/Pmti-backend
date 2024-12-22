import { Module } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { InstructorController } from './instructor.controller';
import { Instructor } from './entities/instructor.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Country } from 'src/country/entities/country.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [InstructorController],
  providers: [InstructorService],
  imports:[ TypeOrmModule.forFeature([Instructor,User,Country]),AuthModule ]
})
export class InstructorModule {}
