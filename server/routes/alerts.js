const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// Called internally when stock drops below threshold
// POST /api/alerts/low-stock
router.post('/low-stock', async (req, res) => {
    const { productName, stock, productId } = req.body;
    try {
        await transporter.sendMail({
            from: `"Vastra Kuteer Alert" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `⚠️ Low Stock Alert: ${productName}`,
            html: `
                <div style="font-family:sans-serif; padding:20px;">
                    <h2 style="color:#dc2626;">⚠️ Low Stock Warning</h2>
                    <p><strong>${productName}</strong> is running low!</p>
                    <p>Current Stock: <strong style="color:#dc2626;">${stock} units remaining</strong></p>
                    <p>Product ID: <code>${productId}</code></p>
                    <p>Please restock soon to avoid losing sales.</p>
                    <a href="http://localhost:5173/admin" style="background:#065f46;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:10px;">Go to Admin Dashboard →</a>
                </div>
            `,
        });
        res.json({ success: true });
    } catch (err) {
        console.error('Low stock alert error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
