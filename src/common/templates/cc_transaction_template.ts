// email-templates.ts
export const EmailTemplates = {
    generateTransactionEmailBody: (data: {
        adminName: string;
        invoiceNumber: string;
        transactionAmount: number;
        transactionDate: string;
        description: string;
        referenceNumber: string;
    }): string => {
        return `
            <p>Dear Student,</p>
            <p><strong>${data.adminName}</strong> ran the following credit card transaction:</p>
            <ul>
                <li><strong>Invoice Number:</strong> ${data.invoiceNumber}</li>
                <li><strong>Amount:</strong> $${data.transactionAmount}</li>
                <li><strong>Date:</strong> ${data.transactionDate}</li>
                <li><strong>Description:</strong> ${data.description}</li>
                <li><strong>Reference Number:</strong> ${data.referenceNumber}</li>
            </ul>
            <p>Thank you for your payment. If you have any questions, feel free to contact us.</p>
            <br>
            <p>Best regards,<br>4PMTI Team</p>
        `;
    },
};
