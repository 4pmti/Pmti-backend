import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CourseEnrollmentsService } from './course-enrollments.service';
import { CreateCourseEnrollmentDto } from './dto/create-course-enrollment.dto';
import { UpdateCourseEnrollmentDto } from './dto/update-course-enrollment.dto';

@Controller('course-enrollments')
export class CourseEnrollmentsController {
  constructor(private readonly courseEnrollmentsService: CourseEnrollmentsService) {}

  @Post()
  create(@Body() createCourseEnrollmentDto: CreateCourseEnrollmentDto) {
    return this.courseEnrollmentsService.create(createCourseEnrollmentDto);
  }

  @Get()
  findAll() {
    return this.courseEnrollmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseEnrollmentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseEnrollmentDto: UpdateCourseEnrollmentDto) {
    return this.courseEnrollmentsService.update(+id, updateCourseEnrollmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseEnrollmentsService.remove(+id);
  }
}
