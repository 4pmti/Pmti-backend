import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Request } from 'express';

@ApiTags('Student')
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) { }


  @Get()
  @ApiOperation({ summary: 'List all students' })
  @ApiResponse({ status: 200, description: 'List of all students' })
  findAll() {
    return this.studentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a student by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Student details' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a student by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Student updated successfully' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentService.update(+id, updateStudentDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a student by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Student deleted successfully' })
  remove(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    return this.studentService.remove(req.user.id, +id, true);
  }
}
