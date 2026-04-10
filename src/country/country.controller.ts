import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Request } from 'express';

@ApiTags('Country')
@Controller('country')
export class CountryController {

  constructor(private readonly countryService: CountryService,
  ) { }

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new country' })
  @ApiResponse({ status: 201, description: 'Country created successfully' })
  create(@Body() createCountryDto: CreateCountryDto) {
    return this.countryService.create(createCountryDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all countries' })
  @ApiResponse({ status: 200, description: 'List of all countries' })
  findAll() {
    return this.countryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a country by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Country ID' })
  @ApiResponse({ status: 200, description: 'Country details' })
  @ApiResponse({ status: 404, description: 'Country not found' })
  findOne(@Param('id') id: string) {
    return this.countryService.findOne(+id);
  }


  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a country by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Country ID' })
  @ApiResponse({ status: 200, description: 'Country updated successfully' })
  update(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto) {

    return this.countryService.update(+id, updateCountryDto);
  }

  @UseGuards(AuthGuard)
  @Delete("/bulk")
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Bulk delete countries' })
  @ApiBody({ schema: { type: 'array', items: { type: 'number' }, example: [1, 2, 3] } })
  @ApiResponse({ status: 200, description: 'Countries deleted successfully' })
  removeBulk(@Body() ids: number[], @Req() req: Request) {
    const userId = req.user?.id ?? '';
    return this.countryService.removeBulk(ids, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a country by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Country ID' })
  @ApiResponse({ status: 200, description: 'Country deleted successfully' })
  remove(@Param('id') id: string) {
    return this.countryService.remove(+id);
  }
}
