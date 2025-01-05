import { Controller, Post, Body } from '@nestjs/common';
import { AuthorizeNetService } from 'src/common/services/authorizenet.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly authorizeNetService: AuthorizeNetService) {}

  @Post('charge')
  async chargeCard(@Body() body:CreatePaymentDto) {
    try {
      const result = await this.authorizeNetService.chargeCreditCard(
        body.amount,
        body.cardNumber,
        body.expirationDate,
        body.cvv,
        body.customerEmail,
        body.transactionKey,
        body.transactionName
      );
      return result;
    } catch (error) {
      return { success: false, error };
    }
  }
}
