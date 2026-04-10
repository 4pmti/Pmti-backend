import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthorizeNetService } from 'src/common/services/authorizenet.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentService } from './payment.service';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { EmailService } from 'src/common/services/email.service';

@ApiTags('Payment')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService,

  ) { }

  @Post('charge')
  @ApiOperation({ summary: 'Charge a credit card via Authorize.Net', description: 'Processes a credit card payment through Authorize.Net payment gateway. Requires valid card details and billing information.' })
  @ApiResponse({ status: 201, description: 'Payment processed successfully' })
  @ApiResponse({ status: 400, description: 'Payment failed or invalid card details' })
  async chargeCard(
    @Req() req: Request,
    @Body() body: CreatePaymentDto) {
    const userId = req.user?.id ?? '';
    return await this.paymentService.create(userId,body);
  }
}
