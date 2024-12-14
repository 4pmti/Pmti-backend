import { Controller, Post, Body } from '@nestjs/common';
import { AuthorizeNetService } from 'src/common/services/authorizenet.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly authorizeNetService: AuthorizeNetService) {}

  @Post('charge')
  async chargeCard(@Body() body: { amount: number; cardNumber: string; expirationDate: string; cvv: string }) {
    try {
      const result = await this.authorizeNetService.chargeCreditCard(
        body.amount,
        body.cardNumber,
        body.expirationDate,
        body.cvv,
      );
      return { success: true, result };
    } catch (error) {
      return { success: false, error };
    }
  }
}
