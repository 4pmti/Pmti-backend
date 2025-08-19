import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AuthorizeNetService } from 'src/common/services/authorizenet.service';
import { isAdmin } from 'src/common/util/utilities';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Payments } from './entities/payment.entity';
import { EmailService } from 'src/common/services/email.service';

@Injectable()
export class PaymentService {

  constructor(
    private readonly dataSource: DataSource,
    private readonly authorizeNetService: AuthorizeNetService,
    private readonly emailService: EmailService,
    @InjectRepository(Payments)
    private readonly paymentRepository: Repository<Payments>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

  ) { }


  async create(userId: string, createPaymentDto: CreatePaymentDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    // Start a transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate admin permissions
      const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
      if (!user || !isAdmin(userId, this.userRepository)) {
        throw new UnauthorizedException('You don’t have permission to perform this action.');
      }

      // Process payment
      let paymentResponse;
      try {
        paymentResponse = await this.authorizeNetService.chargeCreditCard(
          createPaymentDto.amount,
          createPaymentDto.cardNumber,
          createPaymentDto.expirationDate,
          createPaymentDto.cvv,
          createPaymentDto.email,
          createPaymentDto.transactionKey,
          createPaymentDto.transactionName,
        );
      } catch (error) {
        throw new BadRequestException('Payment processing failed.', error);
      }

      createPaymentDto.transactionId = paymentResponse.transId;
      // Save payment details
      const paymentEntity = queryRunner.manager.create(Payments, createPaymentDto);
      paymentEntity.cardNumber = this.maskCardNumber(paymentEntity.cardNumber); // Mask sensitive data
      await queryRunner.manager.save(paymentEntity);

      // Commit transaction
      await queryRunner.commitTransaction();
      //console(paymentResponse);
      // await this.emailService.sendTransactionEmail({
      //   adminName: user.name,
      //   invoiceNumber: createPaymentDto.invoiceNumber,
      //   transactionAmount: createPaymentDto.amount,
      //   transactionDate: paymentEntity.createdAt.toLocaleString(),
      //   description: createPaymentDto.description,
      //   referenceNumber: createPaymentDto.transactionId,
      //   studentEmail: createPaymentDto.email
      // });
      return paymentEntity;
    } catch (error) {
      // Rollback transaction on error
      //console(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Transaction failed.', error.toString());
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
  private maskCardNumber(cardNumber: string): string {
    return cardNumber.replace(/\d(?=\d{4})/g, '*'); // Masks all but the last 4 digits
  }



  findAll() {
    return `This action returns all payment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
