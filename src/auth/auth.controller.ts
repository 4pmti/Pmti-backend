import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { Role } from 'src/common/enums/role';
import { CreateAdminDto } from 'src/admin/dto/create-admin.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { LoginDto } from './dto/login.dto';
import { CreateStudentDto } from 'src/student/dto/create-student.dto';
import { CreateInstructorDto } from 'src/instructor/dto/create-instructor.dto';
import { AuthGuard } from './guard/auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly userService: UserService
  ) { }

  @Post('signup/student')
  async studentSignup(@Body() createStudentDto: CreateStudentDto) {
    console.log(createStudentDto);
    return this.userService.createStudent(createStudentDto);
  }

  @UseGuards(AuthGuard)
  @Post('signup/instructor')
  async teacherSignup(
    @Req() req: Request,
    @Body() createTeacherDto: CreateInstructorDto) {
    const userId = req.user.id;
    return this.userService.createInstructor(userId,createTeacherDto);
  }

  @UseGuards(AuthGuard)
  @Post('signup/admin')
  async adminSignup(
    @Req() req: Request,
    @Body() createAdminDto: CreateAdminDto) {
    const userId = req.user.id;
    return this.userService.createAdmin(userId ,createAdminDto);
  }


  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: LoginDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

}
