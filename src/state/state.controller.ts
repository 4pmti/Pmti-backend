import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StateService } from './state.service';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Request } from 'express';
import { StateFilterDto } from './dto/state-filter.dto';

@ApiTags('State')
@Controller('state')
export class StateController {
  constructor(private readonly stateService: StateService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new state' })
  @ApiResponse({ status: 201, description: 'State created successfully' })
  create(
    @Req() req :Request,
    @Body() createStateDto: CreateStateDto) {
    const userId = req.user.id;
    return this.stateService.create(userId,createStateDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all states with optional filters' })
  @ApiResponse({ status: 200, description: 'List of states' })
  findAll(
    @Query() filterDto: StateFilterDto
  ) {
    return this.stateService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a state by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'State ID' })
  @ApiResponse({ status: 200, description: 'State details' })
  @ApiResponse({ status: 404, description: 'State not found' })
  findOne(@Param('id') id: string) {
    return this.stateService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a state by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'State ID' })
  @ApiResponse({ status: 200, description: 'State updated successfully' })
  update(
    @Req() req :Request,
    @Param('id') id: string, @Body() updateStateDto: UpdateStateDto) {
      const userId = req.user.id;
    return this.stateService.update(+id, userId,updateStateDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a state by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'State ID' })
  @ApiResponse({ status: 200, description: 'State deleted successfully' })
  remove(
    @Req() req :Request,
    @Param('id') id: string) {
    const userId = req.user.id;
    return this.stateService.remove(userId,+id);
  }
}
