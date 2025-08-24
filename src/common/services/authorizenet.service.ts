import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { APIContracts, APIControllers, Constants } from 'authorizenet';
import { AuthorizeNetEnv } from '../enums/authorizenet.env';

// Custom error types for better error handling
export class AuthorizeNetError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'AuthorizeNetError';
  }
}

export class PaymentValidationError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'PaymentValidationError';
  }
}

@Injectable()
export class AuthorizeNetService {
  private readonly logger = new Logger(AuthorizeNetService.name);
  private merchantAuthentication = new APIContracts.MerchantAuthenticationType();

  constructor() {
    // Validate required environment variables
    this.validateEnvironmentVariables();
    
    this.merchantAuthentication.setName(process.env.AUTHORIZE_API_LOGIN_ID);
    this.merchantAuthentication.setTransactionKey(process.env.AUTHORIZE_TRANSACTION_KEY);
  }

  /**
   * Validates required environment variables for AuthorizeNet configuration
   * @throws {InternalServerErrorException} When required environment variables are missing
   */
  private validateEnvironmentVariables(): void {
    const requiredEnvVars = [
      'AUTHORIZE_API_LOGIN_ID',
      'AUTHORIZE_TRANSACTION_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      this.logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
      throw new InternalServerErrorException(
        'AuthorizeNet service configuration is incomplete. Please check environment variables.'
      );
    }
  }

  /**
   * Validates payment input parameters
   * @param amount - Transaction amount
   * @param cardNumber - Credit card number
   * @param expirationDate - Card expiration date
   * @param cvv - Card verification value
   * @param customerEmail - Customer email address
   * @param transactionKey - Unique transaction identifier
   * @param transactionName - Description of the transaction
   * @throws {PaymentValidationError} When validation fails
   */
  private validatePaymentInputs(
    amount: number,
    cardNumber: string,
    expirationDate: string,
    cvv: string,
    customerEmail: string,
    transactionKey: string,
    transactionName: string
  ): void {
    // Validate amount
    if (!amount || amount <= 0) {
      throw new PaymentValidationError('Amount must be greater than 0', 'amount');
    }

    // Validate card number (basic Luhn algorithm check)
    //check this into the prod only not in sandbox
    if (process.env.AUTHORIZE_ENV === AuthorizeNetEnv.PRODUCTION && !this.isValidCardNumber(cardNumber)) {
      throw new PaymentValidationError('Invalid credit card number', 'cardNumber');
    }

    // Validate expiration date format (MM/YYYY)
    if (!this.isValidExpirationDate(expirationDate)) {
      throw new PaymentValidationError('Invalid expiration date format. Use MM/YYYY', 'expirationDate');
    }

    // Validate CVV
    if (!cvv || cvv.length < 3 || cvv.length > 4) {
      throw new PaymentValidationError('CVV must be 3-4 digits', 'cvv');
    }

    // Validate email format
    if (!this.isValidEmail(customerEmail)) {
      throw new PaymentValidationError('Invalid email address format', 'customerEmail');
    }
  }

  /**
   * Validates credit card number using Luhn algorithm
   * @param cardNumber - Credit card number to validate
   * @returns boolean indicating if card number is valid
   */
  private isValidCardNumber(cardNumber: string): boolean {
    if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
      return false;
    }

    // Remove spaces and dashes
    const cleanNumber = cardNumber.replace(/\s+/g, '').replace(/-/g, '');
    
    // Check if it's all digits
    if (!/^\d+$/.test(cleanNumber)) {
      return false;
    }

    // Luhn algorithm implementation
    let sum = 0;
    let isEven = false;

    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i), 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Validates expiration date format
   * @param expirationDate - Expiration date string
   * @returns boolean indicating if format is valid
   * @example "12/25" for December 2025
   */
  private isValidExpirationDate(expirationDate: string): boolean {
    // Format: MM/YY (e.g., "12/25" for December 2025)
    const dateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!dateRegex.test(expirationDate)) {
      return false;
    }

    const [month, year] = expirationDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Convert YY to YYYY (assuming 20xx for years 00-99)
    const expYear = 2000 + parseInt(year, 10);
    const expMonth = parseInt(month, 10);

    // Check if card is expired
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return false;
    }

    return true;
  }

  /**
   * Validates email format
   * @param email - Email address to validate
   * @returns boolean indicating if email format is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Processes a credit card transaction through AuthorizeNet
   * @param amount - Transaction amount
   * @param cardNumber - Credit card number
   * @param expirationDate - Card expiration date (MM/YY format, e.g., "12/25" for December 2025)
   * @param cvv - Card verification value
   * @param customerEmail - Customer email address
   * @param transactionKey - Unique transaction identifier
   * @param transactionName - Description of the transaction
   * @returns Promise with transaction response
   * @throws {PaymentValidationError} When input validation fails
   * @throws {AuthorizeNetError} When AuthorizeNet API call fails
   * @throws {InternalServerErrorException} When unexpected errors occur
   */
  async chargeCreditCard(
    amount: number,
    cardNumber: string,
    expirationDate: string,
    cvv: string,
    customerEmail: string,
    transactionKey: string,
    transactionName: string
  ): Promise<any> {
    try {
      // Validate all input parameters
      this.validatePaymentInputs(amount, cardNumber, expirationDate, cvv, customerEmail, transactionKey, transactionName);

      this.logger.log(`Processing payment transaction: ${transactionKey} for amount: $${amount}`);

      // Create credit card object
      const creditCard = new APIContracts.CreditCardType();
      creditCard.setCardNumber(cardNumber);
      creditCard.setExpirationDate(expirationDate);
      creditCard.setCardCode(cvv);

      // Create payment type
      const paymentType = new APIContracts.PaymentType();
      paymentType.setCreditCard(creditCard);

      // Create transaction request
      const transactionRequest = new APIContracts.TransactionRequestType();
      transactionRequest.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
      transactionRequest.setAmount(amount);
      transactionRequest.setPayment(paymentType);

      // Add customer information
      const customerData = new APIContracts.CustomerDataType();
      customerData.setEmail(customerEmail);
      transactionRequest.setCustomer(customerData);

      // Add order information
      const order = new APIContracts.OrderType();
      order.setInvoiceNumber(transactionKey);
      order.setDescription(transactionName);
      transactionRequest.setOrder(order);

      // Create main request
      const createRequest = new APIContracts.CreateTransactionRequest();
      createRequest.setMerchantAuthentication(this.merchantAuthentication);
      createRequest.setTransactionRequest(transactionRequest);

      // Create controller
      const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());

      // Set environment based on configuration
      if (process.env.AUTHORIZE_ENV === AuthorizeNetEnv.PRODUCTION) {
        ctrl.setEnvironment(Constants.endpoint.production);
        this.logger.log('Using AuthorizeNet production environment');
      } else {
        this.logger.log('Using AuthorizeNet sandbox environment');
      }

      // Execute transaction
      return await this.executeTransaction(ctrl, transactionKey);

    } catch (error) {
      this.handleError(error, transactionKey);
    }
  }

  /**
   * Executes the AuthorizeNet transaction
   * @param ctrl - Transaction controller
   * @param transactionKey - Transaction identifier for logging
   * @returns Promise with transaction response
   */
  private executeTransaction(ctrl: APIControllers.CreateTransactionController, transactionKey: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ctrl.execute(() => {
        try {
          const response = ctrl.getResponse();
          const result = new APIContracts.CreateTransactionResponse(response);
          
          this.logger.log(`Transaction ${transactionKey} processed successfully`);
          
          if (result.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
            const transactionResponse = result.getTransactionResponse();
            this.logger.log(`Transaction ${transactionKey} approved with ID: ${transactionResponse.getTransId()}`);
            resolve(transactionResponse);
          } else {
            // Handle AuthorizeNet API errors
            const messages = result.getMessages();
            const errorMessage = messages.getMessage()[0]?.getText() || 'Unknown AuthorizeNet error';
            const errorCode = messages.getMessage()[0]?.getCode() || 'UNKNOWN_ERROR';
            
            this.logger.error(`Transaction ${transactionKey} failed: ${errorMessage} (Code: ${errorCode})`);
            
            reject(new AuthorizeNetError(
              `Payment processing failed: ${errorMessage}`,
              errorCode,
              { transactionKey, messages: messages.getJSON() }
            ));
          }
                 } catch (error) {
           const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
           this.logger.error(`Error processing transaction ${transactionKey} response: ${errorMessage}`);
           reject(new AuthorizeNetError(
             'Error processing payment response',
             'RESPONSE_PROCESSING_ERROR',
             { transactionKey, originalError: errorMessage }
           ));
         }
      });
    });
  }

  /**
   * Centralized error handling for the service
   * @param error - The error that occurred
   * @param transactionKey - Transaction identifier for logging
   * @throws {PaymentValidationError} When validation errors occur
   * @throws {AuthorizeNetError} When AuthorizeNet API errors occur
   * @throws {InternalServerErrorException} When unexpected errors occur
   */
     private handleError(error: any, transactionKey: string): never {
     const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
     const errorStack = error instanceof Error ? error.stack : undefined;
     
     this.logger.error(`Error in transaction ${transactionKey}: ${errorMessage}`, errorStack);

     if (error instanceof PaymentValidationError) {
       throw new BadRequestException({
         message: error.message,
         field: error.field,
         error: 'VALIDATION_ERROR'
       });
     }

     if (error instanceof AuthorizeNetError) {
       throw new BadRequestException({
         message: error.message,
         code: error.code,
         details: error.details,
         error: 'PAYMENT_PROCESSING_ERROR'
       });
     }

     // Handle unexpected errors
     this.logger.error(`Unexpected error in transaction ${transactionKey}: ${errorMessage}`);
     throw new InternalServerErrorException({
       message: 'An unexpected error occurred while processing the payment',
       error: 'INTERNAL_SERVER_ERROR'
     });
   }
}
