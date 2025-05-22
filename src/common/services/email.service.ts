import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailTemplate } from '../templates/types';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService) {
        this.initializeTransporter();
    }

    private initializeTransporter(): void {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            host: this.configService.get('MAIL_HOST'),
            port: this.configService.get('MAIL_PORT'),
            auth: {
                user: this.configService.get('MAIL_USER'),
                pass: this.configService.get('MAIL_PASSWORD'),
            },
        });
    }

    async sendEmail(options: {
        to: string | string[];
        cc?: string[];
        bcc?: string[];
        template: EmailTemplate;
        attachments?: nodemailer.Attachment[];
    }): Promise<boolean> {
        try {
            await this.transporter.sendMail({
                from: this.configService.get('MAIL_FROM'),
                to: options.to,
                cc: options.cc,
                bcc: options.bcc,
                subject: options.template.subject,
                html: options.template.html,
                attachments: options.attachments
            });
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
}