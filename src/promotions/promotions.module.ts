import { Module } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from './promotions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Country } from 'src/country/entities/country.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Category } from 'src/class/entities/category.entity';
import { ClassType } from 'src/class/entities/classtype.entity';
import { Promotions } from './entities/promotion.entity';

@Module({
  controllers: [PromotionsController],
  providers: [PromotionsService],
  imports:[TypeOrmModule.forFeature([User,Country,Category,ClassType,Promotions]),AuthModule]
})
export class PromotionsModule {}
