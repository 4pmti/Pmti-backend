import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
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


  @UseGuards(AuthGuard)
  @Get('user')
  async getUser(
    @Req() req: Request,
  ){
    const userId = req.user.id;
    //console(userId);
    return this.userService.findOneByUserId(userId);
  }

  @Post('signup/student')
  async studentSignup(@Body() createStudentDto: CreateStudentDto) {
    //console(createStudentDto);
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
