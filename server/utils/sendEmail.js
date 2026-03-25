const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Use real Gmail if credentials exist in .env, otherwise use Ethereal mock emails
    let transporter;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    } else {
        // Fallback for local testing if no .env config is provided
        console.log("No real email credentials found in .env, falling back to Ethereal Test Account...");
        let testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
    }

    const message = {
        from: '"Vastra Kuteer Admin" <noreply@vastrakuteer.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    const info = await transporter.sendMail(message);

    console.log("Message sent: %s", info.messageId);

    // If using ethereal, log a URL where you can VIEW the fake email
    if (!process.env.EMAIL_USER) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("Preview URL: %s", previewUrl);
        return previewUrl;
    }

    return "Check your email inbox";
};

module.exports = sendEmail;
