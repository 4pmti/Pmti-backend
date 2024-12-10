
import { Controller, Get, Post, Body, Patch, Param, Delete,Req, UseGuards, Query } from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Request } from 'express';
import { FilterDto } from './dto/filter.dto';


@Controller('class')
@UseGuards(AuthGuard)
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post()
  create(
    @Req() req: Request,
    @Body() createClassDto: CreateClassDto) {
    const userId = req.user?.id??'';
    return this.classService.create(userId,createClassDto);
  }

  @Get()
  findAll(
    @Query() filterDto: FilterDto
  ) {
    return this.classService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classService.update(+id, updateClassDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classService.remove(+id);
  }
}
