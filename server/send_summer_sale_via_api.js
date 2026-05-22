/**
 * ☀️ Summer Sale — Live API Email Blast
 * Fetches ALL users from the live production API (vastrakuteer.in)
 * and sends Summer Sale emails directly via Gmail SMTP
 * Run: node send_summer_sale_via_api.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://vastrakuteer.in';

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
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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
        <tr>
          <td style="background:linear-gradient(135deg,#f97316 0%,#fb923c 60%,#fbbf24 100%);padding:40px 40px 30px;text-align:center;">
            <h1 style="color:#ffffff;font-size:28px;margin:0 0 6px;letter-spacing:2px;">VASTRA KUTEER</h1>
            <p style="color:rgba(255,255,255,0.9);font-size:13px;margin:0;letter-spacing:3px;text-transform:uppercase;">Ethnic Wear | Handcrafted with Love</p>
          </td>
        </tr>
        <tr>
          <td style="background:#FEF3C7;padding:12px 40px;text-align:center;border-bottom:2px solid #f97316;">
            <span style="color:#92400E;font-weight:700;font-size:14px;letter-spacing:1px;">☀️ SUMMER SALE IS LIVE TODAY! ☀️</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 30px;text-align:center;">
            <div style="font-size:60px;margin-bottom:12px;">☀️</div>
            <h2 style="color:#1f2937;font-size:26px;margin:0 0 10px;">Summer Sale is LIVE Today! 🎉</h2>
            <div style="display:inline-block;background:#FDE68A;color:#1e3a8a;border-radius:20px;padding:6px 20px;font-size:13px;font-weight:700;margin-bottom:24px;border:1px solid #1e3a8a;">
              SALE PERIOD: ${formatDate(event.start)} to ${formatDate(event.end)}
            </div>
            <p style="color:#6b7280;font-size:16px;line-height:1.6;margin:0 0 30px;">
              Dear ${name},<br><br>
              We are celebrating <strong>Summer</strong> with a special <strong>${event.discount}% OFF</strong> on our entire ethnic wear collection!<br>
              Handpicked sarees, silk dupattas and more — all at a beautiful summer discount.
            </p>
            <div style="background:linear-gradient(135deg,#FFF7ED,#FED7AA);border:2px dashed #f97316;border-radius:12px;padding:24px;margin:0 0 30px;box-sizing:border-box;">
              <p style="color:#9a3412;font-size:13px;font-weight:700;margin:0 0 8px;letter-spacing:2px;text-transform:uppercase;">Your Exclusive Coupon Code</p>
              <div style="background:#ffffff;border:1px solid #fdba74;border-radius:8px;padding:14px;margin:0 0 8px;">
                <span style="font-size:32px;font-weight:900;color:#c2410c;letter-spacing:6px;font-family:monospace;">${event.coupon}</span>
              </div>
              <p style="color:#9a3412;font-size:13px;margin:0;"><strong>Flat ${event.discount}% OFF</strong> — Valid till ${formatDate(event.end)}</p>
            </div>
            <div style="margin-bottom:30px;">
              <a href="https://vastrakuteer.in/shop" style="display:inline-block;background:linear-gradient(135deg,#ea580c,#f97316);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:16px;font-weight:700;letter-spacing:1px;">
                Shop Summer Sale →
              </a>
            </div>
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
  console.log('\n☀️  Vastra Kuteer — Summer Sale Email Blast (via Live API)\n');

  // Step 1: Login to get admin token
  console.log('🔐 Logging in to vastrakuteer.in admin...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@vastrakuteer.com', password: 'admin123' })
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) { console.error('❌ Login failed:', loginData.message); process.exit(1); }
  const token = loginData.token;
  console.log('✅ Logged in as admin!\n');

  // Step 2: Fetch all users from live API
  console.log('👥 Fetching all users from live API...');
  const usersRes = await fetch(`${BASE_URL}/api/auth/users`, {
    headers: { 'x-auth-token': token }
  });
  const users = await usersRes.json();
  if (!usersRes.ok) { console.error('❌ Failed to fetch users:', users.message); process.exit(1); }
  console.log(`✅ Found ${users.length} users on live website!\n`);

  // Filter out test/dummy emails
  const recipients = users
    .filter(u => u.email && !u.email.includes('test') && !u.email.includes('mobile@test') && !u.email.includes('example.com'))
    .map(u => ({ name: u.fullName || 'Valued Customer', email: u.email }));

  console.log(`📋 Sending to ${recipients.length} real users:`);
  recipients.forEach(r => console.log(`   • ${r.name} <${r.email}>`));

  // Step 3: Send emails
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  console.log('\n📨 Sending Summer Sale emails...\n');
  let sent = 0, failed = 0, skipped = 0;

  // Also keep track of already emailed (from local run) to avoid duplicates
  const localEmails = new Set([
    'bollepallijagadeesh@gmail.com', 'Anusha.vastraKuteer@gmail.com',
    'admin@vastrakuteer.com', 'sankarr@gmail.com', 'sanjeev@gmail.com',
    'karthik@gmail.com', 'csrch99@gmail.com', 'jmbphy@gmail.com',
    'puligillayashwanth776@gmail.com', '2320030187@klh.edu.in',
    'varshith@gmail.com', 'varshith@vastrakuteer.com', '2320030193@klh.edu.in'
  ]);

  for (const recipient of recipients) {
    // Skip already emailed users
    if (localEmails.has(recipient.email)) {
      console.log(`  ⏭️  Skip (already sent) → ${recipient.email}`);
      skipped++;
      continue;
    }
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
  console.log(`  ⏭️  Skipped : ${skipped} (already sent earlier)`);
  console.log(`  ❌ Failed  : ${failed}`);
  console.log(`  👥 Total   : ${users.length} live users`);
  console.log('══════════════════════════════════════\n');

  process.exit(0);
}

main().catch(err => {
  console.error('\n🔥 Fatal error:', err.message);
  process.exit(1);
});
