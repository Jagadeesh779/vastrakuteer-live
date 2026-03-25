const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const cookieParser = require('cookie-parser');

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch((err) => {
        console.error('MongoDB Connection Error:', err);
        console.log('Running in MOCK MODE due to DB connection failure.');
    });

// Basic Route
app.get('/', (req, res) => {
    res.send('Vastra Kuteer API is Running');
});

// Import Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const uploadRoutes = require('./routes/upload');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', require('./routes/categories'));
app.use('/api/user', require('./routes/user'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', require('./routes/orders'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/admin', require('./routes/admin'));

// ── Serve Production Frontend ────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '../client/dist');
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
        if (!req.url.startsWith('/api')) {
            res.sendFile(path.join(distPath, 'index.html'));
        }
    });
}

// ── Daily Summary Cron (8 AM every day) ──────────────────────────────────────
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Order = require('./models/Order');

cron.schedule('0 8 * * *', async () => {
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const orders = await Order.find({ createdAt: { $gte: yesterday, $lt: today } });
        const revenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
        const delivered = orders.filter(o => o.status === 'Delivered').length;

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
            from: `"Vastra Kuteer" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `📊 Daily Summary — ${yesterday.toDateString()}`,
            html: `
                <div style="font-family:Georgia,serif;max-width:500px;margin:0 auto;padding:30px;background:#F8F8FF;border-radius:12px;">
                    <h1 style="color:#065f46;text-align:center;">Vastra Kuteer</h1>
                    <h2>📊 Daily Summary</h2>
                    <p><strong>Date:</strong> ${yesterday.toDateString()}</p>
                    <table style="width:100%;border-collapse:collapse;margin-top:15px;">
                        <tr style="background:#E6FFFA;"><td style="padding:10px;border-radius:8px;"><strong>Total Orders</strong></td><td style="text-align:right;padding:10px;font-size:22px;font-weight:bold;color:#065f46;">${orders.length}</td></tr>
                        <tr><td style="padding:10px;"><strong>Total Revenue</strong></td><td style="text-align:right;padding:10px;font-size:22px;font-weight:bold;color:#C9960C;">₹${revenue.toLocaleString('en-IN')}</td></tr>
                        <tr style="background:#E6FFFA;"><td style="padding:10px;border-radius:8px;"><strong>Delivered</strong></td><td style="text-align:right;padding:10px;font-size:22px;font-weight:bold;color:#22c55e;">${delivered}</td></tr>
                    </table>
                    <p style="color:#999;font-size:12px;text-align:center;margin-top:20px;">Vastra Kuteer Daily Report</p>
                </div>
            `
        });
        console.log('✅ Daily summary email sent!');
    } catch (err) {
        console.error('Daily summary cron error:', err.message);
    }
}, { timezone: 'Asia/Kolkata' });

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
