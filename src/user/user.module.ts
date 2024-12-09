import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from 'src/student/entities/student.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { User } from './entities/user.entity';
import { BcryptService } from 'src/common/util/bcrypt.service';
import { ConfigModule } from '@nestjs/config';
import typeorm from 'src/config/typeorm';
import { Country } from 'src/country/entities/country.entity';


@Module({
  controllers: [UserController],
  providers: [UserService, BcryptService],
  exports: [BcryptService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm], 
    }),
    TypeOrmModule.forFeature([User, Student, Admin,Country]), 
  ],

})
export class UserModule { }
