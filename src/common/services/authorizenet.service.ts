import { Injectable } from '@nestjs/common';
import { APIContracts, APIControllers } from 'authorizenet';


@Injectable()
export class AuthorizeNetService {
  private merchantAuthentication = new APIContracts.MerchantAuthenticationType();

  constructor() {
    this.merchantAuthentication.setName(process.env.AUTHORIZE_API_LOGIN_ID);
    this.merchantAuthentication.setTransactionKey(process.env.AUTHORIZE_TRANSACTION_KEY);
  }

  async chargeCreditCard(amount: number, cardNumber: string, expirationDate: string, cvv: string): Promise<any> {
    const creditCard = new APIContracts.CreditCardType();
    creditCard.setCardNumber(cardNumber);
    creditCard.setExpirationDate(expirationDate);
    creditCard.setCardCode(cvv);

    const paymentType = new APIContracts.PaymentType();
    paymentType.setCreditCard(creditCard);

    const transactionRequest = new APIContracts.TransactionRequestType();
    transactionRequest.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
    transactionRequest.setAmount(amount);
    transactionRequest.setPayment(paymentType);

    const createRequest = new APIContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(this.merchantAuthentication);
    createRequest.setTransactionRequest(transactionRequest);

    const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());
   // ctrl.setEnvironment(process.env.AUTHORIZE_ENVIRONMENT === 'sandbox' ? APIContracts.SANDBOX : APIContracts.PRODUCTION);

    return new Promise((resolve, reject) => {
      ctrl.execute(() => {
        const response = ctrl.getResponse();
        const result = new APIContracts.CreateTransactionResponse(response);
        if (result.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
          resolve(result.getTransactionResponse());
        } else {
          reject(result.getMessages().getMessage()[0].getText());
        }
      });
    });
  }
}
