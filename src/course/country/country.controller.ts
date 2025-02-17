import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Request } from 'express';

@Controller('country')
export class CountryController {
  
  constructor(private readonly countryService: CountryService,
  ) { }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createCountryDto: CreateCountryDto) {
    return this.countryService.create(createCountryDto);
  }

  @Get()
  findAll() {
    return this.countryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.countryService.findOne(+id);
  }


  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto) {

    return this.countryService.update(+id, updateCountryDto);
  }

  @UseGuards(AuthGuard)
  @Delete("/bulk")
  removeBulk(@Body() ids: number[], @Req() req: Request) {
    const userId = req.user?.id ?? '';
    return this.countryService.removeBulk(ids, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.countryService.remove(+id);
  }
}
