
import { Injectable, UnauthorizedException } from '@nestjs/common';
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

    const user = await this.usersRepository.findOne({
      where: { email }
    });

    if (!user) {
      throw new Error("No User Found with this email.");
    }
    const validUser = await this.bcryptService.comparePasswords(pass, user.password);
    if (!validUser) {
      throw new Error("Wrong Credentials.");
    }


    let realuser: any;
    if (user.role == Role.ADMIN) {
      realuser = await this.adminRepository.findOne({
        where: {
          email: email,
        }
      });
    } else if (user.role == Role.STUDENT) {
      realuser = await this.studentRepository.findOne({
        where: {
          email: email,
        }
      });
    }
    // TODO: add other roles

    const payload = { sub: user.id, username: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
