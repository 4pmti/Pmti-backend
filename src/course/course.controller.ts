import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { FilterDto } from 'src/class/dto/filter.dto';

@ApiTags('Course')
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) { }

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createCourseDto: CreateCourseDto, @Req() req: Request) {
    const userId = req.user.id;
    return this.courseService.create(createCourseDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all courses with optional filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of courses' })
  findAll(
    @Query() filterDto: FilterDto
  ) {
    return this.courseService.findAll(filterDto);
  }


  @Get(':id')
  @ApiOperation({ summary: 'Get a course by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Course details' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  findOne(@Param('id') id: number) {
    return this.courseService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a course by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  update(@Param('id') id: string,@Req() req: Request,@Body() updateCourseDto: UpdateCourseDto) {
    const userId = req.user?.id??'';
    return this.courseService.update(+id, updateCourseDto,userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a course by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  remove(@Param('id') id: string) {
    return this.courseService.remove(+id);
  }
}
