import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MiscService } from './misc.service';
import { CreateMiscDto } from './dto/create-misc.dto';
import { UpdateMiscDto } from './dto/update-misc.dto';

@ApiTags('Misc')
@Controller('misc')
export class MiscController {
  constructor(private readonly miscService: MiscService) { }

  @Post()
  @ApiOperation({ summary: 'Submit a question or inquiry' })
  @ApiResponse({ status: 201, description: 'Question submitted successfully' })
  confirmQuestion(@Body() createMiscDto: CreateMiscDto) {
    return this.miscService.create(createMiscDto);
  }


  @Get()
  @ApiOperation({ summary: 'List all misc entries' })
  @ApiResponse({ status: 200, description: 'List of all misc entries' })
  findAll() {
    return this.miscService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a misc entry by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Misc entry ID' })
  @ApiResponse({ status: 200, description: 'Misc entry details' })
  findOne(@Param('id') id: string) {
    return this.miscService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a misc entry by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Misc entry ID' })
  @ApiResponse({ status: 200, description: 'Misc entry updated successfully' })
  update(@Param('id') id: string, @Body() updateMiscDto: UpdateMiscDto) {
    return this.miscService.update(+id, updateMiscDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a misc entry by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Misc entry ID' })
  @ApiResponse({ status: 200, description: 'Misc entry deleted successfully' })
  remove(@Param('id') id: string) {
    return this.miscService.remove(+id);
  }
}
