import { Injectable } from '@nestjs/common';
import { APIContracts, APIControllers ,Constants} from 'authorizenet';



@Injectable()
export class AuthorizeNetService {
  private merchantAuthentication = new APIContracts.MerchantAuthenticationType();

  constructor() {
    this.merchantAuthentication.setName(process.env.AUTHORIZE_API_LOGIN_ID);
    this.merchantAuthentication.setTransactionKey(process.env.AUTHORIZE_TRANSACTION_KEY);
  }

  async chargeCreditCard(amount: number, cardNumber: string, expirationDate: string, cvv: string, customerEmail: string, transactionKey: string, transactionName: string): Promise<any> {
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

    console.log(JSON.stringify(createRequest.getJSON(), null, 2));

    const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());
   // Defaults to sandbox
	 //ctrl.setEnvironment(Constants.endpoint.production);

    return new Promise((resolve, reject) => {
      ctrl.execute(() => {
        const response = ctrl.getResponse();
        const result = new APIContracts.CreateTransactionResponse(response);
        console.log(JSON.stringify(result.getJSON(), null, 2));
        if (result.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
          resolve(result.getTransactionResponse());
        } else {
          reject(result.getMessages().getMessage()[0].getText());
        }
      });
    });
  }
}
