const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        // 1. Send welcome email to subscriber
        await transporter.sendMail({
            from: `"Vastra Kuteer" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🎉 Welcome to Vastra Kuteer Newsletter!',
            html: `
                <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #F8F8FF; border-radius: 12px;">
                    <h1 style="color: #065f46; font-size: 28px; text-align: center;">Vastra Kuteer</h1>
                    <h2 style="color: #1a1a1a; text-align: center;">Welcome to Our Family! 🌸</h2>
                    <p style="color: #555; line-height: 1.8;">Thank you for subscribing! You're now part of the Vastra Kuteer family. Get ready for:</p>
                    <ul style="color: #555; line-height: 2;">
                        <li>✨ Exclusive deals and early access to sales</li>
                        <li>🆕 New arrival alerts</li>
                        <li>🎁 Special festive offers</li>
                        <li>💌 Curated style tips</li>
                    </ul>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="http://localhost:5173/shop" style="background: linear-gradient(135deg, #065f46, #0d9488); color: white; padding: 12px 32px; border-radius: 50px; text-decoration: none; font-size: 15px; font-weight: bold;">Shop Now</a>
                    </div>
                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">Use code <strong>VASTRA10</strong> for 10% off your next order!</p>
                </div>
            `,
        });

        // 2. Notify owner
        await transporter.sendMail({
            from: `"Vastra Kuteer Bot" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `📧 New Newsletter Subscriber: ${email}`,
            html: `<p>A new user subscribed to the newsletter: <strong>${email}</strong></p><p>Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>`,
        });

        res.json({ success: true, message: 'Subscribed successfully!' });
    } catch (err) {
        console.error('Newsletter email error:', err);
        res.status(500).json({ message: 'Failed to send email. Check server config.' });
    }
});

module.exports = router;
