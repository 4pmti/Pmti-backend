import { EmailTemplate, StudentRegistrationData } from "./types";

export const registrationTemplates = {
    formatDate(date: Date): string {
      return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      });
    },
  
    getConfirmationEmailSubject(data: StudentRegistrationData): string {
      return `Registration Receipt for ${data.className} - ${data.location} - ${this.formatDate(data.startDate)}`;
    },
  
    generateRegistrationConfirmation(data: StudentRegistrationData): EmailTemplate {
      const subject = this.getConfirmationEmailSubject(data);
      const html = `
        <p>Hello ${data.studentName}! Thank you for choosing Project Management Training Institute(TM)(PMTI) for your PMP exam preparation. Your registration for the following class is confirmed.</p>
        
        <p><strong>Date:</strong><br>
        ${this.formatDate(new Date())}</p>
        
        <p><strong>Service Provider:</strong><br>
        Project Management Training Institute<br>
        4835 LBJ Freeway, Suite 220<br>
        Dallas TX, 75244-6004<br>
        Ph:734-786-0104<br>
        Fax:248-809-4060</p>
        
        <p><strong>Order Information:</strong><br>
        <strong>Payment Method:</strong><br>
        ${data.paymentInfo.method}<br>
        <strong>Credit Card Number:</strong><br>
        XXXXXX${data.paymentInfo.cardLastFour}<br>
        <strong>Payment Received:</strong><br>
        ${data.paymentInfo.amount}</p>
        
        <p><strong>Class Information</strong><br>
        <strong>Course Name:</strong><br>
        ${data.className}<br>
        <strong>Course Dates:</strong><br>
        ${this.formatDate(data.startDate)} - ${this.formatDate(data.endDate)}<br>
        <strong>Class Time:</strong><br>
        8.00 AM - 5.30 PM<br>
        <strong>Location:</strong><br>
        ${data.location}</p>
        
        <p><strong>Student Information</strong><br>
        <strong>Name:</strong><br>
        ${data.studentName}<br>
        <strong>Address:</strong><br>
        ${data.studentAddress}<br>
        <strong>Phone:</strong><br>
        ${data.studentPhone}<br>
        <strong>Email:</strong><br>
        ${data.studentEmail}</p>
        
        <p><strong>Billing Information</strong><br>
        <strong>Credit Card Holder Name</strong><br>
        ${data.billing.name}<br>
        <strong>Address:</strong><br>
        ${data.billing.address}<br>
        <strong>City:</strong><br>
        ${data.billing.city}<br>
        <strong>State:</strong><br>
        ${data.billing.state}<br>
        <strong>Country:</strong><br>
        ${data.billing.country}<br>
        <strong>Zip:</strong><br>
        ${data.billing.zip}<br>
        <strong>Bill Phone:</strong><br>
        ${data.billing.phone}<br>
        <strong>Bill Email:</strong><br>
        ${data.billing.email}</p>
      `;
  
      return { subject, html };
    },
  
    generateWelcomeEmail(data: StudentRegistrationData): EmailTemplate {
      const subject = `Welcome to PMTI - ${data.className}`;
      const html = `
        <p>Dear ${data.studentName},</p>
        
        <p>Welcome to PMTI! We're excited to have you join us for the ${data.className}.</p>
        
        <p>In the coming days, you'll receive additional information about your upcoming training, including:</p>
        <ul>
          <li>Pre-course materials</li>
          <li>Course schedule details</li>
          <li>Access to our online learning platform</li>
        </ul>
        
        <p>If you have any questions in the meantime, please don't hesitate to reach out.</p>
        
        <p>Best regards,<br>
        The PMTI Team</p>
      `;
  
      return { subject, html };
    }
  };