import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Request } from 'express';
import { FindPromotionsDto } from './dto/find-promotions.dto';

@UseGuards(AuthGuard)
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) { }

  @Post()
  create(
     @Req() req: Request,
    @Body() createPromotionDto: CreatePromotionDto) {
    const userId = req.user?.id ?? '';
    return this.promotionsService.create(userId,createPromotionDto);
  }

  @Get()
  findAll(@Body() filters: FindPromotionsDto) {
    return this.promotionsService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string, @Body() updatePromotionDto: UpdatePromotionDto) {
      const userId = req.user?.id ?? '';
    return this.promotionsService.update(+id, userId,updatePromotionDto);
  }

  @Delete("/bulk")
  removeBulk(@Body('ids') ids: number[], @Req() req: Request){
    const userId = req.user?.id ?? '';
    return this.promotionsService.bulkRemove(userId,ids);
  }

  
  @Delete(':id')
  remove(
    @Req() req: Request,
    @Param('id') id: string) {
    const userId = req.user?.id ?? '';
    return this.promotionsService.remove(userId,+id);
  }


}
