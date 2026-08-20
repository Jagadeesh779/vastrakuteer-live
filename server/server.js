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

// Basic Route removed to allow React Frontend to serve on '/'

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

// ── Flash Sale Marketing Cron (9 AM every day) ───────────────────────────────
const { getUpcomingEvent, getActiveEvent, EVENTS } = require('./utils/eventCalendar');
const { buildFlashEmail } = require('./utils/emailTemplates');
const { getAllUsers } = require('./utils/jsonDb');
const User = require('./models/User');

const DEFAULT_FLASH_EMAIL_USER = process.env.EMAIL_USER || 'vastrakuteer9@gmail.com';
const DEFAULT_FLASH_EMAIL_PASS = process.env.EMAIL_PASS || 'lisxqpgpcqjuqkpp';

const SENT_LOG_FILE = path.join(__dirname, 'data/sent_email_events.json');

const getSentEvents = () => {
    try {
        if (fs.existsSync(SENT_LOG_FILE)) {
            return JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8'));
        }
    } catch (e) { }
    return {};
};

const recordSentEvent = (eventKey) => {
    try {
        const sentMap = getSentEvents();
        sentMap[eventKey] = new Date().toISOString();
        if (!fs.existsSync(path.dirname(SENT_LOG_FILE))) {
            fs.mkdirSync(path.dirname(SENT_LOG_FILE), { recursive: true });
        }
        fs.writeFileSync(SENT_LOG_FILE, JSON.stringify(sentMap, null, 2));
    } catch (e) {
        console.error('Failed to record sent email event:', e.message);
    }
};

/**
 * Core function: gather all user emails from both DBs and send flash sale blast.
 * Works for ALL events in the calendar.
 * Called by the daily cron, startup check, AND by the admin manual-trigger endpoint.
 */
const sendFlashSaleEmails = async (event) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: DEFAULT_FLASH_EMAIL_USER, pass: DEFAULT_FLASH_EMAIL_PASS }
    });

    // Collect emails from both MongoDB and JSON fallback without duplicates
    let recipientsMap = new Map();
    try {
        if (mongoose.connection.readyState === 1) {
            const mongoUsers = await User.find({}, 'fullName email');
            mongoUsers.forEach(u => {
                if (u.email) recipientsMap.set(u.email.toLowerCase(), { name: u.fullName || 'Valued Customer', email: u.email });
            });
        }
        const jsonUsers = getAllUsers();
        jsonUsers.forEach(u => {
            if (u.email && !recipientsMap.has(u.email.toLowerCase())) {
                recipientsMap.set(u.email.toLowerCase(), { name: u.fullName || 'Valued Customer', email: u.email });
            }
        });
    } catch (e) {
        console.error('[FLASH EMAIL] Failed to fetch users:', e.message);
    }

    let recipients = Array.from(recipientsMap.values());

    if (recipients.length === 0) {
        console.log('[FLASH EMAIL] No recipients found.');
        return { sent: 0, failed: 0 };
    }

    console.log(`[FLASH EMAIL] Sending "${event.name}" email to ${recipients.length} users...`);

    let sent = 0, failed = 0;
    for (const recipient of recipients) {
        try {
            await transporter.sendMail({
                from: `"Vastra Kuteer" <${DEFAULT_FLASH_EMAIL_USER}>`,
                to: recipient.email,
                subject: `${event.emoji} ${event.name} Sale — Flat ${event.discount}% OFF! Code: ${event.coupon}`,
                html: buildFlashEmail(event, recipient.name)
            });
            sent++;
            console.log(`[FLASH EMAIL] ✅ Sent → ${recipient.email}`);
        } catch (err) {
            console.error(`[FLASH EMAIL] ❌ Failed → ${recipient.email}:`, err.message);
            failed++;
        }
    }
    console.log(`[FLASH EMAIL] Done — ${event.name}. Sent: ${sent}, Failed: ${failed}`);
    return { sent, failed };
};

const checkAndTriggerEventEmails = async () => {
    try {
        const eventToSend = getUpcomingEvent() || getActiveEvent();
        if (!eventToSend) return;

        const todayStr = new Date().toISOString().split('T')[0];
        const eventKey = `${eventToSend.id}_${todayStr}`;
        const sentMap = getSentEvents();

        if (sentMap[eventKey]) {
            console.log(`[AUTO FLASH EMAIL] Already sent today for event: ${eventToSend.name} (${eventKey})`);
            return;
        }

        console.log(`[AUTO FLASH EMAIL] 🎉 Auto-triggering "${eventToSend.name}" event blast...`);
        const result = await sendFlashSaleEmails(eventToSend);
        if (result.sent > 0) {
            recordSentEvent(eventKey);
        }
    } catch (err) {
        console.error('[AUTO FLASH EMAIL ERROR]:', err.message);
    }
};

// Export so admin route can call it manually
module.exports.sendFlashSaleEmails = sendFlashSaleEmails;
module.exports.checkAndTriggerEventEmails = checkAndTriggerEventEmails;

// ── Daily cron: fires at 9 AM IST, auto-detects upcoming or active event ─────
cron.schedule('0 9 * * *', async () => {
    await checkAndTriggerEventEmails();
}, { timezone: 'Asia/Kolkata' });

// ── One-Time Blast: Summer Sale Reminder on May 10 at 9 AM IST ───────────────
cron.schedule('0 9 10 5 *', async () => {
    try {
        const summerSale = EVENTS.find(e => e.id === 'summer_sale');
        if (!summerSale) {
            console.log('[MAY 10 BLAST] ❌ summer_sale event not found in calendar.');
            return;
        }
        console.log('[MAY 10 BLAST] ☀️ Sending Summer Sale reminder email to all users...');
        const result = await sendFlashSaleEmails(summerSale);
        console.log(`[MAY 10 BLAST] ✅ Done — Sent: ${result.sent}, Failed: ${result.failed}`);
    } catch (err) {
        console.error('[MAY 10 BLAST] Error:', err.message);
    }
}, { timezone: 'Asia/Kolkata' });

// Run startup check after 5 seconds to catch active events on server boot
setTimeout(() => {
    checkAndTriggerEventEmails();
}, 5000);

// Log all upcoming events on startup
console.log('\n📅 Flash Sale Email Schedule (auto-fires 9 AM IST, 1 day before each):');
EVENTS.forEach(e => {
    console.log(`   ${e.emoji}  ${e.name.padEnd(25)} → starts ${e.start.month}/${e.start.day} | ${e.discount}% OFF | ${e.coupon}`);
});
console.log('');

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
