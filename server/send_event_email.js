/**
 * ══════════════════════════════════════════════════════
 *  Vastra Kuteer — Universal Event Email Sender
 * ══════════════════════════════════════════════════════
 * Sends a Flash Sale email to ALL registered users for
 * any event in the calendar.
 *
 * Usage:
 *   node send_event_email.js                  → auto-picks upcoming or active event
 *   node send_event_email.js akshaya          → Akshaya Tritiya
 *   node send_event_email.js diwali           → Diwali
 *   node send_event_email.js summer_sale      → Summer Sale
 *   node send_event_email.js --list           → list all event IDs
 *
 * For production (Atlas), set MONGODB_URI in .env to your Atlas URI.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { EVENTS, getActiveEvent, getUpcomingEvent } = require('./utils/eventCalendar');
const { buildFlashEmail } = require('./utils/emailTemplates');

// ── List all events ───────────────────────────────────────────────────────────
if (process.argv[2] === '--list') {
    console.log('\n📅 All Event IDs you can use:\n');
    EVENTS.forEach(e => {
        console.log(`  ${e.emoji}  ${e.id.padEnd(18)} → ${e.name} (${e.start.month}/${e.start.day} – ${e.end.month}/${e.end.day}) | ${e.discount}% OFF | ${e.coupon}`);
    });
    console.log('\nExample: node send_event_email.js diwali\n');
    process.exit(0);
}

// ── Pick event ────────────────────────────────────────────────────────────────
let event = null;
const arg = process.argv[2];

if (arg) {
    event = EVENTS.find(e => e.id === arg);
    if (!event) {
        console.error(`\n❌ Unknown event ID: "${arg}"`);
        console.log('Run with --list to see all valid event IDs.');
        process.exit(1);
    }
} else {
    // Auto-pick: upcoming (tomorrow) → active (today)
    event = getUpcomingEvent() || getActiveEvent();
    if (!event) {
        console.log('\n⚠️  No upcoming or active event found today. Use an event ID to send manually.');
        console.log('Example: node send_event_email.js diwali\n');
        process.exit(0);
    }
}

console.log(`\n🎯 Selected event: ${event.emoji} ${event.name} (${event.discount}% OFF — ${event.coupon})`);

// ── Connect & Send ────────────────────────────────────────────────────────────
async function main() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ EMAIL_USER or EMAIL_PASS not set in .env');
        process.exit(1);
    }

    console.log(`🔌 Connecting to MongoDB: ${process.env.MONGODB_URI?.slice(0, 30)}...`);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    const User = require('./models/User');
    const users = await User.find({}, 'fullName email');

    if (users.length === 0) {
        console.log('⚠️  No registered users found in the database.');
        await mongoose.disconnect();
        return;
    }
    console.log(`📋 Found ${users.length} registered users\n`);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    let sent = 0, failed = 0;

    for (const user of users) {
        const name = user.fullName || 'Valued Customer';
        try {
            await transporter.sendMail({
                from: `"Vastra Kuteer" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: `${event.emoji} ${event.name} Sale — Flat ${event.discount}% OFF! Use Code: ${event.coupon}`,
                html: buildFlashEmail(event, name)
            });
            sent++;
            console.log(`  ✅ Sent  → ${user.email} (${name})`);
        } catch (err) {
            failed++;
            console.error(`  ❌ Failed → ${user.email} : ${err.message}`);
        }
    }

    console.log('\n══════════════════════════════════════');
    console.log(`  📨 ${event.emoji} ${event.name} Email Blast Done!`);
    console.log(`  ✅ Sent    : ${sent}`);
    console.log(`  ❌ Failed  : ${failed}`);
    console.log(`  👥 Total   : ${users.length}`);
    console.log('══════════════════════════════════════\n');

    await mongoose.disconnect();
    process.exit(0);
}

main().catch(err => {
    console.error('\n🔥 Fatal error:', err.message);
    process.exit(1);
});
