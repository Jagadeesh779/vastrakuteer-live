/**
 * 🎉 Welcome + Bonus Email Blast
 * Sends a Welcome email with VASTRA10 (10% OFF) bonus coupon
 * to ALL registered users on vastrakuteer.in
 * Run: node send_welcome_bonus.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

const BASE_URL = 'https://vastrakuteer.in';

const buildWelcomeBonus = (name = 'Valued Customer') => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F5F3FF;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:30px 15px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#065f46 0%,#047857 60%,#0d9488 100%);padding:40px;text-align:center;">
            <h1 style="color:#ffffff;font-size:28px;margin:0 0 6px;letter-spacing:2px;">VASTRA KUTEER</h1>
            <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:0;letter-spacing:3px;text-transform:uppercase;">Ethnic Wear | Handcrafted with Love</p>
          </td>
        </tr>

        <!-- Welcome Content -->
        <tr>
          <td style="padding:40px;text-align:center;">
            <div style="font-size:56px;margin-bottom:12px;">🎉</div>
            <h2 style="color:#1f2937;font-size:26px;margin:0 0 16px;">Welcome to Vastra Kuteer, ${name}!</h2>
            <p style="color:#6b7280;font-size:16px;line-height:1.6;margin:0 0 30px;">
              We are so happy to have you with us! You are now part of the Vastra Kuteer family — where every saree tells a story of heritage and grace.<br><br>
              As a token of our gratitude, here is an exclusive <strong>Welcome Bonus</strong> just for you:
            </p>

            <!-- Welcome Bonus Coupon -->
            <div style="background:linear-gradient(135deg,#F0FDF4,#DCFCE7);border:2px dashed #16a34a;border-radius:12px;padding:28px;margin:0 0 30px;box-sizing:border-box;">
              <p style="color:#15803d;font-size:13px;font-weight:700;margin:0 0 8px;letter-spacing:2px;text-transform:uppercase;">🎁 Your Welcome Bonus Coupon</p>
              <p style="color:#166534;font-size:15px;margin:0 0 14px;">Use this code to get <strong>10% OFF</strong> on your first order!</p>
              <div style="background:#ffffff;border:1px solid #86efac;border-radius:8px;padding:16px;margin:0 0 10px;display:inline-block;width:100%;box-sizing:border-box;">
                <span style="font-size:36px;font-weight:900;color:#065f46;letter-spacing:6px;font-family:monospace;">VASTRA10</span>
              </div>
              <p style="color:#166534;font-size:13px;margin:0;"><strong>Flat 10% OFF</strong> — Valid on all products | No minimum order</p>
            </div>

            <!-- Also mention Summer Sale -->
            <div style="background:linear-gradient(135deg,#FFF7ED,#FED7AA);border:2px solid #f97316;border-radius:12px;padding:20px;margin:0 0 30px;box-sizing:border-box;">
              <p style="color:#9a3412;font-size:13px;font-weight:700;margin:0 0 6px;letter-spacing:1px;text-transform:uppercase;">☀️ Bonus — Summer Sale is LIVE!</p>
              <p style="color:#7c2d12;font-size:14px;margin:0 0 10px;">Use <strong style="font-family:monospace;font-size:16px;letter-spacing:2px;">SUMMER15</strong> for an extra <strong>15% OFF</strong> on all products during our Summer Sale!</p>
              <p style="color:#9a3412;font-size:12px;margin:0;">Valid till 20 Jun 2026</p>
            </div>

            <!-- CTA -->
            <a href="https://vastrakuteer.in/shop" style="display:inline-block;background:linear-gradient(135deg,#065f46,#0d9488);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:16px;font-weight:700;letter-spacing:1px;margin-bottom:30px;">
              Start Shopping →
            </a>

            <!-- Features -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
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
            <p style="color:#9ca3af;font-size:12px;margin:0 0 8px;">Thank you for joining Vastra Kuteer.</p>
            <p style="color:#9ca3af;font-size:12px;margin:0;">© 2026 Vastra Kuteer | <a href="https://vastrakuteer.in" style="color:#065f46;">vastrakuteer.in</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`;

async function main() {
  console.log('\n🎉 Vastra Kuteer — Welcome + Bonus Email Blast\n');

  // Step 1: Login
  console.log('🔐 Logging in to vastrakuteer.in admin...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@vastrakuteer.com', password: 'admin123' })
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) { console.error('❌ Login failed:', loginData.message); process.exit(1); }
  const token = loginData.token;
  console.log('✅ Logged in!\n');

  // Step 2: Fetch all users
  console.log('👥 Fetching all users from live website...');
  const usersRes = await fetch(`${BASE_URL}/api/auth/users`, {
    headers: { 'x-auth-token': token }
  });
  const users = await usersRes.json();
  if (!usersRes.ok) { console.error('❌ Failed to fetch users'); process.exit(1); }

  // Filter real users only (skip test/dummy emails)
  const recipients = users.filter(u =>
    u.email &&
    !u.email.includes('example.com') &&
    !u.email.includes('mobile@test')
  ).map(u => ({ name: u.fullName || 'Valued Customer', email: u.email }));

  console.log(`✅ Found ${recipients.length} users to send welcome + bonus email\n`);
  recipients.forEach(r => console.log(`   • ${r.name} <${r.email}>`));

  // Step 3: Send emails
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  console.log('\n📨 Sending Welcome + Bonus emails...\n');
  let sent = 0, failed = 0;

  for (const recipient of recipients) {
    try {
      await transporter.sendMail({
        from: `"Vastra Kuteer" <${process.env.EMAIL_USER}>`,
        to: recipient.email,
        subject: `🎉 Welcome to Vastra Kuteer, ${recipient.name.split(' ')[0]}! Here's your 10% Welcome Bonus 🎁`,
        html: buildWelcomeBonus(recipient.name)
      });
      sent++;
      console.log(`  ✅ Sent  → ${recipient.email} (${recipient.name})`);
    } catch (err) {
      failed++;
      console.error(`  ❌ Failed → ${recipient.email}: ${err.message}`);
    }
  }

  console.log('\n══════════════════════════════════════');
  console.log(`  🎉 Welcome + Bonus Email Blast Done!`);
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
