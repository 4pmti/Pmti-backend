import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { queues } from 'src/config/queue';
import { Job } from 'bullmq';
import { EmailService } from 'src/common/services/email.service';
import { EmailJobData, EmailJobType, EmailTemplate } from 'src/common/templates/types';
import { registrationTemplates } from 'src/common/templates/registration_template_pmp';
import { rescheduleStudentTemplate } from 'src/common/templates/reschedule_student';
import { ConfigService } from '@nestjs/config';

@Injectable()
@Processor(queues.email)
export class EmailQueueProcessor extends WorkerHost {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService
  ) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<any> {
    try {
      const { type, data, recipients, cc, bcc, attachments } = job.data;
      let template: EmailTemplate;

      // Handle different email types and generate appropriate template
      switch (type) {
        case EmailJobType.REGISTRATION_CONFIRMATION:
          template = registrationTemplates.generateRegistrationConfirmation(data);
          break;

        case EmailJobType.WELCOME_EMAIL:
          template = registrationTemplates.generateWelcomeEmail(data);
          break;

        case EmailJobType.ACP:
          template = registrationTemplates.generateWelcomeEmail(data);
          break;

        case EmailJobType.PMP:
          template = registrationTemplates.generateWelcomeEmail(data);
          break;

        case EmailJobType.CAPM:
          template = registrationTemplates.generateWelcomeEmail(data);
          break;

        case EmailJobType.RESCHEDULE_CONFIRMATION:
          template = this.generateRescheduleEmail(data.subject, data.html);
          break;

        case EmailJobType.TRANSACTION_CONFIRMATION:
          template = this.generateTransactionEmail(data);
          break;

        default:
          throw new Error(`Unknown email job type: ${type}`);
      }


    //  return true;

     // Send the email using the email service
      return await this.emailService.sendEmail({
        to: recipients,
        cc,
        bcc,
        template,
        attachments
      });

    } catch (error) {
      console.error('Error processing email job:', error);
      throw error;
    }
  }


  private generateRescheduleEmail(subject: string, html: string): EmailTemplate {
    return {
      subject: subject,
      html: html
    };
  }

  private generateTransactionEmail(data: any): EmailTemplate {
    // Implementation of transaction email template
    return {
      subject: `Transaction Confirmation - ${data.invoiceNumber}`,
      html: `...` // Your HTML template here
    };
  }
}
