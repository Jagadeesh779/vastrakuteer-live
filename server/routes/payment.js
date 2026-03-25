const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();
require('dotenv').config();

let razorpay;
try {
    if (process.env.RAZORPAY_KEY_ID) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    } else {
        console.warn("WARNING: RAZORPAY_KEY_ID is missing. Payment features will be disabled.");
    }
} catch (err) {
    console.error("Error initializing Razorpay:", err.message);
}

// Get Razorpay Key Route
router.get('/get-key', (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// Create Order Route
router.post('/create-order', async (req, res) => {
    try {
        const { amount } = req.body; // Amount in INR (rupees)

        if (!razorpay) {
            return res.status(500).json({
                error: "Razorpay keys are missing or invalid in server environment variables."
            });
        }

        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// Verify Payment Route
router.post('/verify-payment', (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            res.json({ success: true, message: 'Payment Verified' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid Signature' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// Refund Route — called automatically on order cancellation
router.post('/refund', async (req, res) => {
    try {
        const { razorpay_payment_id, amount } = req.body;

        if (!razorpay) {
            return res.status(500).json({ success: false, error: 'Razorpay not configured on server.' });
        }

        if (!razorpay_payment_id) {
            return res.status(400).json({ success: false, error: 'Payment ID is required for refund.' });
        }

        const refundOptions = {};
        if (amount) {
            refundOptions.amount = Math.round(amount * 100); // Convert INR to paise
        }
        // If amount is not provided, Razorpay issues a full refund

        const refund = await razorpay.payments.refund(razorpay_payment_id, refundOptions);

        res.json({
            success: true,
            refundId: refund.id,
            amount: refund.amount / 100, // Convert back to INR for response
            status: refund.status
        });
    } catch (error) {
        console.error('Refund Error:', error);
        res.status(500).json({ success: false, error: error.error?.description || error.message || 'Refund failed' });
    }
});

module.exports = router;
