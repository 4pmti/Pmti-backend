import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { Role } from 'src/common/enums/role';
import { CreateAdminDto } from 'src/admin/dto/create-admin.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { LoginDto } from './dto/login.dto';
import { CreateStudentDto } from 'src/student/dto/create-student.dto';
import { CreateInstructorDto } from 'src/instructor/dto/create-instructor.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly userService: UserService
  ) { }

  @Post('signup/student')
  async studentSignup(@Body() createStudentDto: CreateStudentDto) {
    return this.userService.createStudent(createStudentDto);
  }

  @Post('signup/instructor')
  async teacherSignup(@Body() createTeacherDto: CreateInstructorDto) {
    return this.userService.createInstructor(createTeacherDto);
  }

  @Post('signup/admin')
  async adminSignup(@Body() createAdminDto: CreateAdminDto) {
    return this.userService.createAdmin(createAdminDto);
  }
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: LoginDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

}
