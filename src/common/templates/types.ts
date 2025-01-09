export interface StudentRegistrationData {
    studentName: string;
    studentEmail: string;
    studentPhone: string;
    studentAddress: string;
    className: string;
    location: string;
    startDate: Date;
    endDate: Date;
    paymentInfo: {
      method: string;
      cardLastFour: string;
      amount: number;
    };
    billing: {
      name: string;
      address: string;
      city: string;
      state: string;
      country: string;
      zip: string;
      phone: string;
      email: string;
    };
  }
  
  export interface EmailTemplate {
    subject: string;
    html: string;
  }
  