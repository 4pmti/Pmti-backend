export const rescheduleStudentTemplate = (data: {
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
}) => {
  return `
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
};
