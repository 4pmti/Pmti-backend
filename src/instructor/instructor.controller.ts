import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InstructorService } from './instructor.service';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { InstructorFilterDto } from './dto/intructorfilter.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Request } from 'express';

@ApiTags('Instructor')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@Controller('instructor')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new instructor' })
  @ApiResponse({ status: 201, description: 'Instructor created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(
    @Req() req : Request,
    @Body() createInstructorDto: CreateInstructorDto) {
    const userId = req.user?.id ?? '';
    return this.instructorService.create(userId,createInstructorDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all instructors with optional filters' })
  @ApiResponse({ status: 200, description: 'Filtered list of instructors' })
  findAll(
    @Query() filterDto: InstructorFilterDto
  ) {
    return this.instructorService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an instructor by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Instructor ID' })
  @ApiResponse({ status: 200, description: 'Instructor details' })
  @ApiResponse({ status: 404, description: 'Instructor not found' })
  findOne(@Param('id') id: string) {
    return this.instructorService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an instructor by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Instructor ID' })
  @ApiResponse({ status: 200, description: 'Instructor updated successfully' })
  update(@Param('id') id: string, @Body() updateInstructorDto: UpdateInstructorDto, @Req() req: Request) {
    const userId = req.user?.id ?? '';
    return this.instructorService.update(+id, updateInstructorDto,userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an instructor by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Instructor ID' })
  @ApiResponse({ status: 200, description: 'Instructor deleted successfully' })
  @ApiResponse({ status: 409, description: 'Instructor has linked classes' })
  remove(@Param('id') id: string, @Req() req: Request) {
    const userId = req.user?.id ?? '';
    return this.instructorService.remove(userId,+id);
  }

  @Delete("/bulk")
  @ApiOperation({ summary: 'Bulk delete instructors' })
  @ApiBody({ schema: { type: 'array', items: { type: 'number' }, example: [1, 2, 3] } })
  @ApiResponse({ status: 200, description: 'Instructors deleted successfully' })
  removeBulk(@Body() ids: number[], @Req() req: Request) {
    const userId = req.user?.id ?? '';
    return this.instructorService.removeBulk(ids, userId);
  }
}
