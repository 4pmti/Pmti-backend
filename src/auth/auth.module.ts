import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Student } from 'src/student/entities/student.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { UserService } from 'src/user/user.service';
import { BcryptService } from 'src/common/util/bcrypt.service';
import { ConfigModule } from '@nestjs/config';
import typeorm from 'src/config/typeorm';
import { Country } from 'src/country/entities/country.entity';
import { AuthGuard } from './guard/auth.guard';
import { Instructor } from 'src/instructor/entities/instructor.entity';
import { State } from 'src/state/entities/state.entity';
import { Location } from 'src/location/entities/location.entity';
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.SECRET_KEY ?? "pmti",
      signOptions: { expiresIn: '6h' },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forFeature([User, Student, Admin,Country,Instructor, State, Location]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, BcryptService],
  exports:[JwtModule]
})
export class AuthModule { }
