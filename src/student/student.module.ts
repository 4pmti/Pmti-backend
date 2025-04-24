import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { Location } from 'src/location/entities/location.entity';
import { State } from 'src/state/entities/state.entity';
import { Country } from 'src/country/entities/country.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Student, Location, State, Country])],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule { }
