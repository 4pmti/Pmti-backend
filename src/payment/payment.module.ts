import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { AuthorizeNetService } from 'src/common/services/authorizenet.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService,AuthorizeNetService],
})
export class PaymentModule {}
