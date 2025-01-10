import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailTemplate, StudentRegistrationData } from '../templates/types';
import { registrationTemplates } from '../templates/registration_template';
import { EmailTemplates } from '../templates/cc_transaction_template';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // Initialize the transporter with SMTP configuration
        this.transporter = nodemailer.createTransport({
            service :"gmail",
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
            },
        });

    }


    async sendRegistrationEmails(data: StudentRegistrationData): Promise<boolean> {
        try {
            // Send confirmation email to both student and admin
            const confirmationTemplate = registrationTemplates.generateRegistrationConfirmation(data);
            await this.sendEmail({
                to: [data.studentEmail, process.env.ADMIN_EMAIL],
                template: confirmationTemplate,
            });

            // Send welcome email to student only
            const welcomeTemplate = registrationTemplates.generateWelcomeEmail(data);
            await this.sendEmail({
                to: data.studentEmail,
                template: welcomeTemplate,
            });

            return true;
        } catch (error) {
            console.error('Error sending registration emails:', error);
            return false;
        }
    }

    async sendTransactionEmail(data: {
        adminName: string;
        invoiceNumber: string;
        transactionAmount: number;
        transactionDate: string;
        description: string;
        referenceNumber: string;
        studentEmail: string;
    }): Promise<boolean> {
        try {
            const emailBody = EmailTemplates.generateTransactionEmailBody({
                adminName: data.adminName,
                invoiceNumber: data.invoiceNumber,
                transactionAmount: data.transactionAmount,
                transactionDate: data.transactionDate,
                description: data.description,
                referenceNumber: data.referenceNumber,
            });

            const mailOptions = {
                from: process.env.MAIL_FROM, // Sender address
                to: [data.studentEmail, process.env.ADMIN_EMAIL], // Recipients
                subject: `Successful Credit Card Transaction <${data.adminName}> <${data.transactionDate}>`,
                html: emailBody,
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Transaction email sent successfully:', result.messageId);
            return true;
        } catch (error) {
            console.error('Failed to send transaction email:', error);
            return false;
        }
    }


    private async sendEmail(options: {
        to: string | string[];
        template: EmailTemplate;
    }): Promise<boolean> {
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM_EMAIL,
                to: options.to,
                subject: options.template.subject,
                html: options.template.html,
            });
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }

    /**
     * Send a simple email
     */
    async sendEmail2(to: string, subject: string, text: string, html?: string) {
        try {
            const mailOptions = {
                from: process.env.MAIL_FROM,
                to,
                subject,
                text,
                html,
            };

            const result = await this.transporter.sendMail(mailOptions);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            throw new Error(`Failed to send email: ${error}`);
        }
    }

    /**
     * Send an email with attachments
     */
    async sendEmailWithAttachments(
        to: string,
        subject: string,
        text: string,
        attachments: nodemailer.Attachment[],
        html?: string,
    ) {
        try {
            const mailOptions = {
                from: process.env.MAIL_FROM,
                to,
                subject,
                text,
                html,
                attachments,
            };

            const result = await this.transporter.sendMail(mailOptions);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            throw new Error(`Failed to send email with attachments: ${error}`);
        }
    }

    /**
     * Send a template-based email
     */
    async sendTemplateEmail(
        to: string,
        subject: string,
        template: string,
        context: Record<string, any>,
    ) {
        try {
            // You can integrate with template engines like handlebars or ejs here
            const html = template.replace(
                /\${(\w+)}/g,
                (_, key) => context[key] || '',
            );

            const mailOptions = {
                from: process.env.MAIL_FROM,
                to,
                subject,
                html,
            };

            const result = await this.transporter.sendMail(mailOptions);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            throw new Error(`Failed to send template email: ${error}`);
        }
    }

    /**
     * Verify SMTP connection
     */
    async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            return true;
        } catch (error) {
            throw new Error(`SMTP connection verification failed: ${error}`);
        }
    }
}