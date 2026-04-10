import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Request } from 'express';
import { FindPromotionsDto } from './dto/find-promotions.dto';

@ApiTags('Promotions')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new promotion' })
  @ApiResponse({ status: 201, description: 'Promotion created successfully' })
  create(
    @Req() req: Request,
    @Body() createPromotionDto: CreatePromotionDto) {
    const userId = req.user?.id ?? '';
    return this.promotionsService.create(userId, createPromotionDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a promotion by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Promotion ID' })
  @ApiResponse({ status: 200, description: 'Promotion details' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(+id);
  }

  @Get()
  @ApiOperation({ summary: 'List all promotions with optional filters' })
  @ApiResponse({ status: 200, description: 'List of promotions' })
  findAll(@Body() filters: FindPromotionsDto) {
    return this.promotionsService.findAll(filters);
  }



  @Patch(':id')
  @ApiOperation({ summary: 'Update a promotion by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Promotion ID' })
  @ApiResponse({ status: 200, description: 'Promotion updated successfully' })
  update(
    @Req() req: Request,
    @Param('id') id: string, @Body() updatePromotionDto: UpdatePromotionDto) {
    const userId = req.user?.id ?? '';
    return this.promotionsService.update(+id, userId, updatePromotionDto);
  }

  @Delete("/bulk")
  @ApiOperation({ summary: 'Bulk delete promotions' })
  @ApiBody({ schema: { type: 'object', properties: { ids: { type: 'array', items: { type: 'number' }, example: [1, 2, 3] } } } })
  @ApiResponse({ status: 200, description: 'Promotions deleted successfully' })
  removeBulk(@Body('ids') ids: number[], @Req() req: Request) {
    const userId = req.user?.id ?? '';
    return this.promotionsService.bulkRemove(userId, ids);
  }


  @Delete(':id')
  @ApiOperation({ summary: 'Delete a promotion by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Promotion ID' })
  @ApiResponse({ status: 200, description: 'Promotion deleted successfully' })
  remove(
    @Req() req: Request,
    @Param('id') id: string) {
    const userId = req.user?.id ?? '';
    return this.promotionsService.remove(userId, +id);
  }


}
