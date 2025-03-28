import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { AuthorizeNetService } from 'src/common/services/authorizenet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Payments } from './entities/payment.entity';
import { AuthModule } from 'src/auth/auth.module';
import { EmailService } from 'src/common/services/email.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService,AuthorizeNetService,EmailService],
  imports: [TypeOrmModule.forFeature([User,Payments]),  AuthModule,]
})
export class PaymentModule {}
