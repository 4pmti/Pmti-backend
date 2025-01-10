import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthorizeNetService } from 'src/common/services/authorizenet.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentService } from './payment.service';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { EmailService } from 'src/common/services/email.service';

@UseGuards(AuthGuard)
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService,
 
  ) { }

  @Post('charge')
  async chargeCard(
    @Req() req: Request,
    @Body() body: CreatePaymentDto) {
    const userId = req.user?.id ?? '';
    return await this.paymentService.create(userId,body);
  }
}
