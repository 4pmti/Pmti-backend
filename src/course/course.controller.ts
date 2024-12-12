import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { FilterDto } from 'src/class/dto/filter.dto';

@Controller('course')
@UseGuards(AuthGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) { }

  @Post()
  create(@Body() createCourseDto: CreateCourseDto, @Req() req: Request) {
    const userId = req.user.id;
    return this.courseService.create(createCourseDto, userId);
  }

  @Get()
  findAll(
    @Query() filterDto: FilterDto
  ) {
    return this.courseService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.courseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string,@Req() req: Request,@Body() updateCourseDto: UpdateCourseDto) {
    const userId = req.user?.id??'';
    return this.courseService.update(+id, updateCourseDto,userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseService.remove(+id);
  }
}
