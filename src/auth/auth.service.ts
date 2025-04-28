
import { Injectable, InternalServerErrorException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { Role } from 'src/common/enums/role';
import { BcryptService } from 'src/common/util/bcrypt.service';
import { Student } from 'src/student/entities/student.entity';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,

    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private bcryptService: BcryptService,
  ) { }
  async signIn(
    email: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    try {
      console.log(email, pass);
      const user = await this.usersRepository.findOne({
        where: { email }
      });

      if (!user) {
        throw new BadRequestException("No User Found with this email.");
      }
      const validUser = await this.bcryptService.comparePasswords(pass, user.password);
      if (!validUser) {
        throw new BadRequestException("Wrong Credentials.");
      }


      // let realuser: any;
      // if (user.roles.includes(Role.ADMIN))
      //   realuser = await this.adminRepository.findOne({
      //     where: {
      //       email: email,
      //     }
      //   });
      // } else if (ser.role == Roule.STUDENT) {
      //   realuser = await this.studentRepository.findOne({
      //     where: {
      //       email: email,
      //     }
      //   });
      // }
      // TODO: add other roles

      const payload = { id: user.id, email: user.email, roles: user.roles };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Something went wrong." + error);
    }
  }
}
