/**
 * One-time script: Send Akshaya Tritiya Flash Sale email to ALL users
 * Run: node send_akshaya_email.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// ── Akshaya Tritiya Event ─────────────────────────────────────────────────────
const event = {
    id: 'akshaya',
    name: 'Akshaya Tritiya',
    emoji: '🪙',
    start: { month: 4, day: 18 },
    end:   { month: 4, day: 20 },
    coupon: 'AKSHAYA20',
    discount: 20
};

// ── Email Template (vastrakuteer.in links) ────────────────────────────────────
const formatDate = (d) => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[d.month - 1]} ${d.day}`;
};

const buildFlashEmail = (name = 'Valued Customer') => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F5F3FF;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:30px 15px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#065f46 0%,#047857 60%,#0d9488 100%);padding:40px 40px 30px;text-align:center;">
            <h1 style="color:#ffffff;font-size:28px;margin:0 0 6px;letter-spacing:2px;">VASTRA KUTEER</h1>
            <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:0;letter-spacing:3px;text-transform:uppercase;">Ethnic Wear | Handcrafted with Love</p>
          </td>
        </tr>

        <!-- Flash Badge -->
        <tr>
          <td style="background:#FEF3C7;padding:12px 40px;text-align:center;border-bottom:2px solid #F59E0B;">
            <span style="color:#92400E;font-weight:700;font-size:14px;letter-spacing:1px;">⚡ FLASH SALE ALERT ⚡</span>
          </td>
        </tr>

        <!-- Main Content -->
        <tr>
          <td style="padding:40px 40px 30px;text-align:center;">
            <div style="font-size:56px;margin-bottom:12px;">${event.emoji}</div>
            <h2 style="color:#1f2937;font-size:26px;margin:0 0 10px;">
              ${event.name} Sale is HERE! 🎉
            </h2>

            <!-- Sale Date Range -->
            <div style="display:inline-block;background:#FDE68A;color:#1e3a8a;border-radius:20px;padding:6px 20px;font-size:13px;font-weight:700;margin-bottom:24px;border:1px solid #1e3a8a;">
              SALE PERIOD: ${formatDate(event.start)} to ${formatDate(event.end)}
            </div>

            <p style="color:#6b7280;font-size:16px;line-height:1.6;margin:0 0 30px;">
              Dear ${name},<br><br>
              We are celebrating <strong>${event.name}</strong> with a special <strong>${event.discount}% OFF</strong> on our entire ethnic wear collection!<br>
              Handpicked sarees, silk dupattas and more — all at a beautiful discount.
            </p>

            <!-- Coupon Box -->
            <div style="background:linear-gradient(135deg,#F0FDF4,#DCFCE7);border:2px dashed #16a34a;border-radius:12px;padding:24px;margin:0 0 30px;box-sizing:border-box;">
              <p style="color:#15803d;font-size:13px;font-weight:700;margin:0 0 8px;letter-spacing:2px;text-transform:uppercase;">Your Exclusive Coupon Code</p>
              <div style="background:#ffffff;border:1px solid #86efac;border-radius:8px;padding:14px;margin:0 0 8px;">
                <span style="font-size:32px;font-weight:900;color:#065f46;letter-spacing:6px;font-family:monospace;">${event.coupon}</span>
              </div>
              <p style="color:#166534;font-size:13px;margin:0;"><strong>Flat ${event.discount}% OFF</strong> — Valid for ${event.name} Sale period only</p>
            </div>

            <!-- CTA Button -->
            <div style="margin-bottom:30px;">
              <a href="https://vastrakuteer.in/shop" style="display:inline-block;background:linear-gradient(135deg,#065f46,#0d9488);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:16px;font-weight:700;letter-spacing:1px;">
                Shop the ${event.name} Sale →
              </a>
            </div>

            <!-- Features -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="text-align:center;padding:10px;"><div style="font-size:24px;">🚚</div><div style="font-size:12px;color:#6b7280;margin-top:4px;">Free Shipping<br>above ₹2999</div></td>
                <td style="text-align:center;padding:10px;"><div style="font-size:24px;">🔒</div><div style="font-size:12px;color:#6b7280;margin-top:4px;">Secure<br>Checkout</div></td>
                <td style="text-align:center;padding:10px;"><div style="font-size:24px;">↩️</div><div style="font-size:12px;color:#6b7280;margin-top:4px;">7-Day<br>Returns</div></td>
                <td style="text-align:center;padding:10px;"><div style="font-size:24px;">💎</div><div style="font-size:12px;color:#6b7280;margin-top:4px;">100%<br>Authentic</div></td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F8F8FF;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:12px;margin:0 0 8px;">You are receiving this email because you are a registered customer of Vastra Kuteer.</p>
            <p style="color:#9ca3af;font-size:12px;margin:0;">© 2026 Vastra Kuteer | <a href="https://vastrakuteer.in" style="color:#065f46;">vastrakuteer.in</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`;

// ── Main Send Function ────────────────────────────────────────────────────────
async function main() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ EMAIL_USER or EMAIL_PASS not set in .env');
        process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    const User = require('./models/User');
    const users = await User.find({}, 'fullName email');

    if (users.length === 0) {
        console.log('⚠️  No registered users found in database.');
        await mongoose.disconnect();
        return;
    }
    console.log(`📋 Found ${users.length} registered users`);

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
                subject: `🪙 Akshaya Tritiya Sale is LIVE! Flat 20% OFF — Use AKSHAYA20`,
                html: buildFlashEmail(name)
            });
            sent++;
            console.log(`  ✅ Sent → ${user.email}`);
        } catch (err) {
            failed++;
            console.error(`  ❌ Failed → ${user.email} : ${err.message}`);
        }
    }

    console.log('\n─────────────────────────────');
    console.log(`📨 Done! Sent: ${sent} | Failed: ${failed} | Total: ${users.length}`);
    console.log('─────────────────────────────');

    await mongoose.disconnect();
    process.exit(0);
}

main().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
