const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'vastrakuteer9@gmail.com',
        pass: 'lisxqpgpcqjuqkpp'
    }
});

transporter.sendMail({
    from: '"Vastra Kuteer" <vastrakuteer9@gmail.com>',
    to: 'vastrakuteer9@gmail.com',
    subject: 'Vastra Kuteer Test Email',
    html: '<h2>Vastra Kuteer OTP Test</h2><p>This is a test OTP email.</p>'
}).then(info => {
    console.log('SUCCESS: Email sent successfully!');
    console.log('Message ID:', info.messageId);
}).catch(err => {
    console.error('ERROR: Failed to send email:', err.message);
});
