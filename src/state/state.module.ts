import { Module } from '@nestjs/common';
import { StateService } from './state.service';
import { StateController } from './state.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { State } from './entities/state.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/user/entities/user.entity';
import { Country } from 'src/country/entities/country.entity';

@Module({
  controllers: [StateController],
  providers: [StateService],
  imports: [TypeOrmModule.forFeature([State,User,Country]),AuthModule]
})
export class StateModule {}
