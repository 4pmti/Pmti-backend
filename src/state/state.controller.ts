import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { StateService } from './state.service';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Request } from 'express';
import { StateFilterDto } from './dto/state-filter.dto';

@Controller('state')
export class StateController {
  constructor(private readonly stateService: StateService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Req() req :Request,
    @Body() createStateDto: CreateStateDto) {
    const userId = req.user.id;
    return this.stateService.create(userId,createStateDto);
  }

  @Get()
  findAll(
    @Query() filterDto: StateFilterDto
  ) {
    return this.stateService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stateService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Req() req :Request,
    @Param('id') id: string, @Body() updateStateDto: UpdateStateDto) {
      const userId = req.user.id;
    return this.stateService.update(+id, userId,updateStateDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(
    @Req() req :Request,
    @Param('id') id: string) {
    const userId = req.user.id;
    return this.stateService.remove(userId,+id);
  }
}
