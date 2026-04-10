import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Request } from 'express';
import { FindAllDto } from './dto/find-all.dto';

@ApiTags('Location')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({ status: 201, description: 'Location created successfully' })
  create(@Body() createLocationDto: CreateLocationDto, @Req() req: Request) {
    const userId = req.user.id
    return this.locationService.create(userId,createLocationDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all locations with optional filters' })
  @ApiResponse({ status: 200, description: 'List of locations' })
  findAll(@Query() findAllDto: FindAllDto) {
    return this.locationService.findAll(findAllDto);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.locationService.findOne(+id);
  // }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a location by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Location ID' })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  update(@Param('id') id: string, @Req() req: Request,@Body() updateLocationDto: UpdateLocationDto) {
    const userId = req.user.id
    return this.locationService.update(userId,+id, updateLocationDto);
  }
}
