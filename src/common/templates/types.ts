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

export interface PortalLoginData {
  studentName: string;
  studentEmail: string;
  password: string;
  expiryDate: Date;
  className: string;
  location: string;
  startDate: Date;
  classEndDate: Date;
}

export interface EmailTemplate {
    subject: string;
    html: string;
}

export interface EmailJobData {
    type: EmailJobType;
    data: any;
    recipients: string[];
    cc?: string[];
    bcc?: string[];
    attachments?: Array<{
        filename: string;
        content: Buffer | string;
        contentType?: string;
    }>;
}

export enum EmailJobType {
    REGISTRATION_CONFIRMATION = 'REGISTRATION_CONFIRMATION',
    WELCOME_EMAIL = 'WELCOME_EMAIL',
    TRANSACTION_CONFIRMATION = 'TRANSACTION_CONFIRMATION',
    RESCHEDULE_CONFIRMATION = 'RESCHEDULE_CONFIRMATION',
    ACP = 'ACP',
    PMP = 'PMP',
    CAPM = 'CAPM',
    PORTAL_LOGIN = 'PORTAL_LOGIN',
}

export interface RescheduleEmailData {
  adminName: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  oldLocation: string;
  oldStartDate: string;
  oldEndDate: string;
  newLocation: string;
  newStartDate: string;
  newEndDate: string;
  address: string;
}
  