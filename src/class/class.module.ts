import { Module } from '@nestjs/common';
import { ClassService } from './class.service';
import { CategoryController, ClassController, ClassTypeController } from './class.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from 'src/student/entities/student.entity';
import { User } from 'src/user/entities/user.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { ClassType } from './entities/classtype.entity';
import { Location } from '../location/entities/location.entity';
import { Instructor } from 'src/instructor/entities/instructor.entity';
import { Category } from './entities/category.entity';
import { Country } from 'src/country/entities/country.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Class } from './entities/class.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { State } from 'src/state/entities/state.entity';

@Module({
  controllers: [ClassController, CategoryController, ClassTypeController],
  providers: [ClassService, AuthModule],
  imports: [TypeOrmModule.forFeature([Student, User, Admin, ClassType, Location, State, Instructor, Category, Country, Class, Enrollment]), AuthModule]
})
export class ClassModule { }
