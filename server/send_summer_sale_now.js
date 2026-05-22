/**
 * ☀️ Summer Sale — Direct Email Blast (No API, No MongoDB needed)
 * Reads users from local data/users.json AND MongoDB (if available)
 * Sends emails directly using Gmail SMTP
 * Run: node send_summer_sale_now.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const event = {
    id: 'summer_sale',
    name: 'Summer Sale',
    emoji: '☀️',
    start: { month: 4, day: 25 },
    end: { month: 6, day: 20 },
    coupon: 'SUMMER15',
    discount: 15
};

const formatDate = (d) => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[d.month - 1]} ${d.day}`;
};

const buildEmail = (name = 'Valued Customer') => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FFF7ED;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:30px 15px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#f97316 0%,#fb923c 60%,#fbbf24 100%);padding:40px 40px 30px;text-align:center;">
            <h1 style="color:#ffffff;font-size:28px;margin:0 0 6px;letter-spacing:2px;">VASTRA KUTEER</h1>
            <p style="color:rgba(255,255,255,0.9);font-size:13px;margin:0;letter-spacing:3px;text-transform:uppercase;">Ethnic Wear | Handcrafted with Love</p>
          </td>
        </tr>

        <!-- Sale Badge -->
        <tr>
          <td style="background:#FEF3C7;padding:12px 40px;text-align:center;border-bottom:2px solid #f97316;">
            <span style="color:#92400E;font-weight:700;font-size:14px;letter-spacing:1px;">☀️ SUMMER SALE IS LIVE TODAY! ☀️</span>
          </td>
        </tr>

        <!-- Main Content -->
        <tr>
          <td style="padding:40px 40px 30px;text-align:center;">
            <div style="font-size:60px;margin-bottom:12px;">☀️</div>
            <h2 style="color:#1f2937;font-size:26px;margin:0 0 10px;">
              Summer Sale is LIVE Today! 🎉
            </h2>

            <div style="display:inline-block;background:#FDE68A;color:#1e3a8a;border-radius:20px;padding:6px 20px;font-size:13px;font-weight:700;margin-bottom:24px;border:1px solid #1e3a8a;">
              SALE PERIOD: ${formatDate(event.start)} to ${formatDate(event.end)}
            </div>

            <p style="color:#6b7280;font-size:16px;line-height:1.6;margin:0 0 30px;">
              Dear ${name},<br><br>
              We are celebrating <strong>Summer</strong> with a special <strong>${event.discount}% OFF</strong> on our entire ethnic wear collection!<br>
              Handpicked sarees, silk dupattas and more — all at a beautiful summer discount.
            </p>

            <!-- Coupon Box -->
            <div style="background:linear-gradient(135deg,#FFF7ED,#FED7AA);border:2px dashed #f97316;border-radius:12px;padding:24px;margin:0 0 30px;box-sizing:border-box;">
              <p style="color:#9a3412;font-size:13px;font-weight:700;margin:0 0 8px;letter-spacing:2px;text-transform:uppercase;">Your Exclusive Coupon Code</p>
              <div style="background:#ffffff;border:1px solid #fdba74;border-radius:8px;padding:14px;margin:0 0 8px;">
                <span style="font-size:32px;font-weight:900;color:#c2410c;letter-spacing:6px;font-family:monospace;">${event.coupon}</span>
              </div>
              <p style="color:#9a3412;font-size:13px;margin:0;"><strong>Flat ${event.discount}% OFF</strong> — Valid till ${formatDate(event.end)}</p>
            </div>

            <!-- CTA Button -->
            <div style="margin-bottom:30px;">
              <a href="https://vastrakuteer.in/shop" style="display:inline-block;background:linear-gradient(135deg,#ea580c,#f97316);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:16px;font-weight:700;letter-spacing:1px;">
                Shop Summer Sale →
              </a>
            </div>

            <!-- Features Row -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="text-align:center;padding:10px;">
                  <div style="font-size:24px;">🚚</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:4px;">Free Shipping<br>above ₹2999</div>
                </td>
                <td style="text-align:center;padding:10px;">
                  <div style="font-size:24px;">🔒</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:4px;">Secure<br>Checkout</div>
                </td>
                <td style="text-align:center;padding:10px;">
                  <div style="font-size:24px;">↩️</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:4px;">7-Day<br>Returns</div>
                </td>
                <td style="text-align:center;padding:10px;">
                  <div style="font-size:24px;">💎</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:4px;">100%<br>Authentic</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#FFF7ED;padding:24px 40px;text-align:center;border-top:1px solid #fed7aa;">
            <p style="color:#9ca3af;font-size:12px;margin:0 0 8px;">You are receiving this email because you are a registered customer of Vastra Kuteer.</p>
            <p style="color:#9ca3af;font-size:12px;margin:0;">© 2026 Vastra Kuteer | <a href="https://vastrakuteer.in" style="color:#ea580c;">vastrakuteer.in</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`;

async function main() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ EMAIL_USER or EMAIL_PASS not set in .env');
        process.exit(1);
    }

    console.log('\n☀️  Vastra Kuteer — Summer Sale Email Blast\n');
    console.log('📧 Email:', process.env.EMAIL_USER);

    // Collect recipients from JSON DB
    let recipients = [];
    const USERS_FILE = path.join(__dirname, 'data', 'users.json');
    if (fs.existsSync(USERS_FILE)) {
        try {
            const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
            users.forEach(u => {
                if (u.email && !recipients.find(r => r.email === u.email)) {
                    recipients.push({ name: u.fullName || u.name || 'Valued Customer', email: u.email });
                }
            });
            console.log(`📂 JSON DB: Found ${users.length} users`);
        } catch (e) {
            console.warn('⚠️  Could not read users.json:', e.message);
        }
    }

    // Also try MongoDB
    try {
        console.log('🔌 Trying MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        const User = require('./models/User');
        const mongoUsers = await User.find({}, 'fullName email');
        mongoUsers.forEach(u => {
            if (!recipients.find(r => r.email === u.email)) {
                recipients.push({ name: u.fullName || 'Valued Customer', email: u.email });
            }
        });
        console.log(`🍃 MongoDB: Found ${mongoUsers.length} additional users`);
        await mongoose.disconnect();
    } catch (e) {
        console.log('⚠️  MongoDB not available (using JSON DB only)');
    }

    if (recipients.length === 0) {
        console.log('⚠️  No users found to email!');
        process.exit(0);
    }

    console.log(`\n👥 Total recipients: ${recipients.length}`);
    recipients.forEach(r => console.log(`   • ${r.name} <${r.email}>`));

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    console.log('\n📨 Sending emails...\n');
    let sent = 0, failed = 0;

    for (const recipient of recipients) {
        try {
            await transporter.sendMail({
                from: `"Vastra Kuteer" <${process.env.EMAIL_USER}>`,
                to: recipient.email,
                subject: `☀️ Summer Sale is LIVE! Flat 15% OFF — Use Code SUMMER15`,
                html: buildEmail(recipient.name)
            });
            sent++;
            console.log(`  ✅ Sent  → ${recipient.email} (${recipient.name})`);
        } catch (err) {
            failed++;
            console.error(`  ❌ Failed → ${recipient.email}: ${err.message}`);
        }
    }

    console.log('\n══════════════════════════════════════');
    console.log(`  ☀️  Summer Sale Email Blast Done!`);
    console.log(`  ✅ Sent    : ${sent}`);
    console.log(`  ❌ Failed  : ${failed}`);
    console.log(`  👥 Total   : ${recipients.length}`);
    console.log('══════════════════════════════════════\n');

    process.exit(0);
}

main().catch(err => {
    console.error('\n🔥 Fatal error:', err.message);
    process.exit(1);
});
