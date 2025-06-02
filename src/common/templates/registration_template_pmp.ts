import { EmailTemplate, RescheduleEmailData, StudentRegistrationData, PortalLoginData } from "./types";



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
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          color: #333;
          background-color:rgb(12, 88, 220);
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 700px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        h2 {
          color: #2a7ae2;
          font-size: 24px;
          margin-bottom: 10px;
        }
        p {
          line-height: 1.8;
          color: #555;
        }
        .section {
          margin-bottom: 25px;
        }
        .section strong {
          color: #2a7ae2;
          font-weight: 600;
        }
        .order-info, .class-info, .student-info, .billing-info {
          background-color: #f2f6fc;
          padding: 15px;
          border-radius: 8px;
          margin-top: 10px;
          border: 1px solid #e0e0e0;
        }
        .order-info {
          background: linear-gradient(135deg,rgb(157, 25, 25), #3e54d3);
          color: white;
        }
        .order-info strong, .order-info p {
          color: white;
        }
        .class-info, .student-info, .billing-info {
          background-color: #f9f9f9;
        }
        .cta-btn {
          display: inline-block;
          padding: 12px 25px;
          font-size: 16px;
          font-weight: bold;
          text-align: center;
          text-decoration: none;
          background-color: #2a7ae2;
          color: white;
          border-radius: 5px;
          margin-top: 20px;
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
          transition: background-color 0.3s ease;
        }
        .cta-btn:hover {
          background-color: #1f5bbf;
        }
        .footer {
          text-align: center;
          font-size: 14px;
          margin-top: 40px;
          color: #888;
        }
        .footer a {
          color: #2a7ae2;
          text-decoration: none;
        }
        .footer a:hover {
          text-decoration: underline;
        }
      </style>
      <div class="container">
        <h2>Hello ${data.studentName}!</h2>
        <p>Thank you for choosing Project Management Training Institute(TM)(PMTI) for your PMP exam preparation. Your registration for the following class is confirmed.</p>
        
        <div class="section">
          <strong>Date:</strong> ${this.formatDate(new Date())}
        </div>

        <div class="section">
          <strong>Service Provider:</strong><br>
          Project Management Training Institute<br>
          4835 LBJ Freeway, Suite 220<br>
          Dallas TX, 75244-6004<br>
          Ph: 734-786-0104<br>
          Fax: 248-809-4060
        </div>
        
        <div class="section order-info">
          <strong>Order Information:</strong><br>
          <strong>Payment Method:</strong> ${data.paymentInfo.method}<br>
          <strong>Credit Card Number:</strong> ${data.paymentInfo.cardLastFour}<br>
          <strong>Payment Received:</strong> ${data.paymentInfo.amount}
        </div>
        
        <div class="section class-info">
          <strong>Class Information:</strong><br>
          <strong>Course Name:</strong> ${data.className}<br>
          <strong>Course Dates:</strong> ${this.formatDate(data.startDate)} - ${this.formatDate(data.endDate)}<br>
          <strong>Class Time:</strong> 8:00 AM - 5:30 PM<br>
          <strong>Location:</strong> ${data.location}
        </div>
        
        <div class="section student-info">
          <strong>Student Information:</strong><br>
          <strong>Name:</strong> ${data.studentName}<br>
          <strong>Address:</strong> ${data.studentAddress}<br>
          <strong>Phone:</strong> ${data.studentPhone}<br>
          <strong>Email:</strong> ${data.studentEmail}
        </div>

        <div class="section billing-info">
          <strong>Billing Information:</strong><br>
          <strong>Credit Card Holder Name:</strong> ${data.billing.name}<br>
          <strong>Address:</strong> ${data.billing.address}<br>
          <strong>City:</strong> ${data.billing.city}<br>
          <strong>State:</strong> ${data.billing.state}<br>
          <strong>Country:</strong> ${data.billing.country}<br>
          <strong>Zip:</strong> ${data.billing.zip}<br>
          <strong>Bill Phone:</strong> ${data.billing.phone}<br>
          <strong>Bill Email:</strong> ${data.billing.email}
        </div>
        
        <a href="#" class="cta-btn">View Your Course Details</a>

        <div class="footer">
          <p>For any questions, feel free to <a href="mailto:support@pmtinstitute.com">contact our support team</a>.</p>
          <p>&copy; 2025 Project Management Training Institute, All Rights Reserved.</p>
        </div>
      </div>
    `;

    return { subject, html };
  },

  generateWelcomeEmail(data: StudentRegistrationData): EmailTemplate {
    const subject = `Welcome to PMTI - ${data.className}`;
    const html = `
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          color: #333;
          background-color: #f4f7fc;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 700px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        h2 {
          color: #2a7ae2;
          font-size: 24px;
          margin-bottom: 10px;
        }
        p {
          line-height: 1.8;
          color: #555;
        }
        ul {
          list-style-type: square;
          padding-left: 20px;
        }
        .cta-btn {
          display: inline-block;
          padding: 12px 25px;
          font-size: 16px;
          font-weight: bold;
          text-align: center;
          text-decoration: none;
          background-color: #2a7ae2;
          color: white;
          border-radius: 5px;
          margin-top: 20px;
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
          transition: background-color 0.3s ease;
        }
        .cta-btn:hover {
          background-color: #1f5bbf;
        }
        .footer {
          text-align: center;
          font-size: 14px;
          margin-top: 40px;
          color: #888;
        }
        .footer a {
          color: #2a7ae2;
          text-decoration: none;
        }
        .footer a:hover {
          text-decoration: underline;
        }
      </style>
      <div class="container">
        <h2>Dear ${data.studentName},</h2>
        <p>Welcome to PMTI! We're excited to have you join us for the ${data.className}.</p>
        
        <p>In the coming days, you'll receive additional information about your upcoming training, including:</p>
        <ul>
          <li>Pre-course materials</li>
          <li>Course schedule details</li>
          <li>Access to our online learning platform</li>
        </ul>
        
        <p>If you have any questions in the meantime, please don't hesitate to reach out.</p>
        
        <p>Best regards,<br>The PMTI Team</p>

        <a href="#" class="cta-btn">Access Your Pre-Course Materials</a>

        <div class="footer">
          <p>For inquiries, please <a href="mailto:support@pmtinstitute.com">contact us</a>.</p>
          <p>&copy; 2025 Project Management Training Institute, All Rights Reserved.</p>
        </div>
      </div>
    `;

    return { subject, html };
  },

  generateRescheduleEmail(data: RescheduleEmailData): EmailTemplate {
    const subject = `Rescheduled Class for ${data.studentName} - ${data.oldLocation}`;
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Class Rescheduling Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 20px;
        }
        .details {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            font-size: 0.9em;
            color: #666666;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>PMTI PMP Bootcamp - Class Rescheduling Confirmation</h2>
        </div>
        
        <div class="content">
            <p>Dear ${data.studentName},</p>
            
            <p>This is to confirm that your request for reschedule is complete.</p>
            
            <div class="details">
                <p><strong>${data.adminName}</strong> has rescheduled <strong>${data.studentName}</strong> (${data.studentId} & ${data.studentEmail}) from:</p>
                <p><strong>${data.oldLocation}</strong> (${data.oldStartDate} - ${data.oldEndDate})</p>
                <p>To:</p>
                <p><strong>${data.newLocation}</strong> (${data.newStartDate} - ${data.newEndDate})</p>
                <p>at ${data.address}</p>
            </div>

            <p><strong>Cancellation policy:</strong> Cancellation on any postponed or rescheduled classes results in forfeiture of course fees and or any rescheduling fees.</p>
        </div>

        <div class="footer">
            <p>Best regards,<br>PMTI Team</p>
            <p>From: info@4pmti.com</p>
        </div>
    </div>
</body>
</html>
`;
    return { subject, html };
  },

  generatePortalLoginEmail(data: PortalLoginData): EmailTemplate {
    const subject = `Portal Login for ${data.className} - ${data.location} - ${this.formatDate(data.startDate)}`;
    const html = `
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          color: #333;
          background-color: #f4f7fc;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 700px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        h2 {
          color: #2a7ae2;
          font-size: 24px;
          margin-bottom: 20px;
        }
        p {
          line-height: 1.8;
          color: #555;
          margin-bottom: 15px;
        }
        .login-info {
          background-color: #f2f6fc;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border: 1px solid #e0e0e0;
        }
        .important-steps {
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border: 1px solid #e0e0e0;
        }
        ul {
          padding-left: 20px;
          margin-bottom: 20px;
        }
        li {
          margin-bottom: 10px;
          color: #555;
        }
        .disclaimer {
          font-size: 0.9em;
          color: #666;
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
        }
        .social-links {
          margin: 20px 0;
        }
        .social-links a {
          color: #2a7ae2;
          text-decoration: none;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          font-size: 0.9em;
          color: #666;
        }
      </style>
      <div class="container">
        <h2>Hello ${data.studentName},</h2>
        
        <p>Welcome to PMTI PMI Authorized PMP Certification Training Boot Camp Course. The entire student related information for your class is on the PMTI student portal. Please access this portal by using the following login access information. This portal access is valid for a maximum of six months from the class end date. Additional access can be purchased for a maximum of six more months.</p>
        
        <div class="login-info">
          <p><strong>PMTI Student Portal:</strong> http://www.OnlinePMTI.com/PMP</p>
          <p><strong>User Name:</strong> ${data.studentEmail}</p>
          <p><strong>Password:</strong> ${data.password}</p>
          <p><strong>Expires on:</strong> ${this.formatDate(data.expiryDate)}</p>
        </div>

        <div class="important-steps">
          <p>After you login at this new PMTI student site, please review:</p>
          <ol>
            <li><strong>OnlinePMTI Intro Video:</strong> This video is right on the portal home page once you login. It provides a walk through of the portal, the application process, and gives ideas on how to avoid getting your application rejected.</li>
            <li><strong>Steps to PMP Certification:</strong> This document outlines the steps you will need to prepare for the PMP examination including - becoming a PMI member, using our FREE online course, and registering for the PMP exam.</li>
            <li><strong>PMP Application Preparation Tool:</strong> This Excel based tool will assist you with preparing your PMP exam application. It helps in estimating hours and documenting your experience using PMI lingo.</li>
            <li><strong>PMI Authorized PMP Exam Prep Book:</strong> You will receive a fully paid (non-refundable) PMI Developed PMP Exam Course Material. PMTI recommends you read this book before attending the class to maximize learning. It increases your chances of success.</li>
            <li><strong>Diagnostic (Readiness) Test:</strong> Complete this full-length simulated PMP test to get an idea of where you stand in your preparation. Aim for 75% on this test.</li>
            <li><strong>When to schedule the exam?</strong> Score 75% or better on the full-length readiness test and the four full-length (180 questions) simulation tests on our student portal to be ready. If you have not scored 75% or better, repeat review of the books, videos, and practice tests until you are scoring around 90%.</li>
          </ol>
        </div>

        <div class="social-links">
          <p>Earn $50 (Amazon gift card) by referring a friend here! https://www.4pmti.com/Referral/</p>
          <p>PMTI LinkedIn Group: Join at https://www.linkedin.com/company/project-management-training-institute-pmti-</p>
          <p>PMTI Facebook: Follow us at https://www.facebook.com/PMTInstitute/</p>
        </div>

        <p>Attire for the class is business casual. Computers may not be used while class is in session other than for testing. Please adjust your browser's "safe list" to receive any emails from @4pmti.com.</p>

        <div class="disclaimer">
          <p>By accessing above information, you agree under penalty of perjury of law that you are an active registered student of PMTI. All of our courses are registered with PMI. This material is the sole property of PMTI and has been registered with PMI as an PMI Authorized Training Partner (PMI-ATP). Therefore, no part of this course material may be reproduced, stored in a retrieval system, transmitted in any form or means - electronic, photocopying, recording or otherwise. Such actions constitute violation of PMTI copyrights and PMI code of ethics and will be reported to PMI and PMTI will impose severe legal penalties.</p>
        </div>

        <div class="important-steps">
          <h3>Non-attendance, Reschedules, and Cancellations:</h3>
          <ul>
            <li>Non-attendance of class partially or entirely results in forfeiture of course fees and voidance of guarantee terms.</li>
            <li>Reschedule or cancellation of class registration must be made by email to info@4pmti.com.</li>
            <li>For all registrants, this rescheduling and cancellation policy starts immediately after registration.</li>
          </ul>

          <h4>Cancellation:</h4>
          <p>If you cancel after registration the following cancellation fees apply. This cancellation fee is in addition to the non-refundable fee of $125 for PMI provided PMP Exam Prep Course Material:</p>
          <ul>
            <li>Cancellation from the time of registration to 1 week prior to the class start date is $895</li>
            <li>Cancellation from 1 week prior to the class start date results in no refund of class fees</li>
          </ul>

          <h4>Reschedule:</h4>
          <p>A non-refundable re-scheduling fee will be applicable according to the following schedule:</p>
          <ul>
            <li>Rescheduling up to 1 week before the class is $195</li>
            <li>Rescheduling from 1 week prior to the class start date up to the class start date is $295</li>
          </ul>
        </div>

        <div class="disclaimer">
          <h3>Guarantee Terms (if applicable):</h3>
          <p>We guarantee your success in passing the PMP® exam provided that the following conditions are met:</p>
          <ol>
            <li>You have attended each day of training, without interruption</li>
            <li>You take three (3) attempts of the relevant certification exam(s) within 90 calendar days of completing the course</li>
            <li>Followed all the instructions provided in the class, including but not limited to "Exam Strategy" and other documents/videos</li>
            <li>No accidental events that are not in control of PMTI such as system failure, or power loss have occurred during your exam</li>
            <li>You have taken 4 full length (180 questions) PMTI simulation exams after the class and scored 75% or greater in each before your 1st certification exam attempt</li>
          </ol>
        </div>

        <div class="footer">
          <p>Thank You and Best Regards,</p>
          <p>PMTI PMP® Training Team</p>
          <p>Dallas, TX - 75244</p>
          <p>Phone: (734) 786-0104</p>
          <p>Email: info@4PMTI.com</p>
          <p>https://www.4PMTI.com</p>
          <p>Student Portal: http://www.OnlinePMTI.com</p>
        </div>
      </div>
    `;

    return { subject, html };
  }
};
