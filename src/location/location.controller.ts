import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Request } from 'express';

@Controller('location')
@UseGuards(AuthGuard)
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  create(@Body() createLocationDto: CreateLocationDto, @Req() req: Request) {
    const userId = req.user.id
    return this.locationService.create(userId,createLocationDto);
  }

  @Get()
  findAll() {
    return this.locationService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.locationService.findOne(+id);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req: Request,@Body() updateLocationDto: UpdateLocationDto) {
    const userId = req.user.id
    return this.locationService.update(userId,+id, updateLocationDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.locationService.remove(+id);
  //}
}
