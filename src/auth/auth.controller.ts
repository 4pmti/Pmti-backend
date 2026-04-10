import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly userService: UserService
  ) { }


  @UseGuards(AuthGuard)
  @Get('user')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUser(
    @Req() req: Request,
  ){
    const userId = req.user.id;
    //console(userId);
    return this.userService.findOneByUserId(userId);
  }

  @Post('signup/student')
  @ApiOperation({ summary: 'Register a new student (public)' })
  @ApiResponse({ status: 201, description: 'Student registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or email already exists' })
  async studentSignup(@Body() createStudentDto: CreateStudentDto) {
    //console(createStudentDto);
    return this.userService.createStudent(createStudentDto);
  }

  @UseGuards(AuthGuard)
  @Post('signup/instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Register a new instructor (admin only)' })
  @ApiResponse({ status: 201, description: 'Instructor registered successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async teacherSignup(
    @Req() req: Request,
    @Body() createTeacherDto: CreateInstructorDto) {
    const userId = req.user.id;
    return this.userService.createInstructor(userId,createTeacherDto);
  }

  @UseGuards(AuthGuard)
  @Post('signup/admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Register a new admin user (admin only)' })
  @ApiResponse({ status: 201, description: 'Admin registered successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async adminSignup(
    @Req() req: Request,
    @Body() createAdminDto: CreateAdminDto) {
    const userId = req.user.id;
    return this.userService.createAdmin(userId ,createAdminDto);
  }


  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'JWT access token returned' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  signIn(@Body() signInDto: LoginDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

}
