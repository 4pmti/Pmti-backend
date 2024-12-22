import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { InstructorFilterDto } from './dto/intructorfilter.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Request } from 'express';
@UseGuards(AuthGuard)
@Controller('instructor')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) { }

  @Post()
  create(@Body() createInstructorDto: CreateInstructorDto) {
    return this.instructorService.create(createInstructorDto);
  }

  @Get()
  findAll(
    @Query() filterDto: InstructorFilterDto
  ) {
    return this.instructorService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.instructorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInstructorDto: UpdateInstructorDto, @Req() req: Request) {
    const userId = req.user?.id ?? '';
    return this.instructorService.update(+id, updateInstructorDto,userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const userId = req.user?.id ?? '';
    return this.instructorService.remove(userId,+id);
  }
    @Delete("/bulk")
    removeBulk(@Body() ids: number[], @Req() req: Request) {
      const userId = req.user?.id ?? '';
      return this.instructorService.removeBulk(ids, userId);
    }
}
