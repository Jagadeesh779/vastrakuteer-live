const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const emailUser = process.env.EMAIL_USER || 'vastrakuteer9@gmail.com';
    const emailPass = process.env.EMAIL_PASS || 'lisxqpgpcqjuqkpp';

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: emailUser,
            pass: emailPass,
        },
    });

    const message = {
        from: `"Vastra Kuteer" <${emailUser}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || undefined,
    };

    const info = await transporter.sendMail(message);
    console.log("Message sent: %s", info.messageId);

    return "Check your email inbox";
};

module.exports = sendEmail;
