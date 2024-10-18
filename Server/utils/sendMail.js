import nodemailer from 'nodemailer';

export const sendEmail= async(to, subject, text, html)=>{
    // Create a transporter
    const transporter = nodemailer.createTransport({
        host: 'smtp.example.com', // Replace with your SMTP server
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'pragyan1516@gmail.com.com', // Your email
            pass: 'mePr@gyan123 kc', // Your email password
        },
    });

    // Set up email data
    const mailOptions = {
        from: '"Your Name" <your-email@example.com>', // Sender address
        to: to, // Recipient address
        subject: subject, // Subject line
        text: text, // Plain text body
        html: html, // HTML body
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Message sent: ${info.messageId}`);
    } catch (error) {
        console.error(`Error: ${error}`);
    }
}

// Example usage
sendEmail(
    'pragyan1516@gmail.com.com',
    'Hello!',
    'This is a plain text message.',
    '<b>This is an HTML message.</b>'
);