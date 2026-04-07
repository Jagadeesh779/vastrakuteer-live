/**
 * Marketing Email Engine for Vastra Kuteer
 * -----------------------------------------
 * Builds beautiful HTML Flash Sale emails for batch delivery.
 */

/**
 * Generates a gorgeous Flash News email for upcoming event promotion.
 * @param {object} event  - Event object from eventCalendar.js
 * @param {string} name   - Recipient's name (or "Valued Customer")
 * @returns {string} HTML string
 */
const buildFlashEmail = (event, name = 'Valued Customer') => `
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
              ${event.name} is Tomorrow! 🎉
            </h2>
            <p style="color:#6b7280;font-size:16px;line-height:1.6;margin:0 0 30px;">
              Dear ${name},<br><br>
              We are celebrating <strong>${event.name}</strong> with a special <strong>${event.discount}% OFF</strong> on our entire ethnic wear collection!<br>
              Handpicked sarees, silk dupattas and more — all at a beautiful discount.
            </p>

            <!-- Coupon Box -->
            <div style="background:linear-gradient(135deg,#F0FDF4,#DCFCE7);border:2px dashed #16a34a;border-radius:12px;padding:24px;margin:0 0 30px;display:inline-block;width:100%;box-sizing:border-box;">
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

/**
 * Generates a welcome email for new users (with active event awareness).
 * @param {string} name     - Customer's name
 * @param {object|null} event - Active event or null
 * @returns {string} HTML string
 */
const buildWelcomeEmail = (name, event = null) => `
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
            <h2 style="color:#1f2937;font-size:26px;margin:0 0 16px;">Welcome, ${name}!</h2>
            <p style="color:#6b7280;font-size:16px;line-height:1.6;margin:0 0 30px;">
              Your account has been created successfully. We are delighted to welcome you to the Vastra Kuteer family — where every saree tells a story of heritage and grace.
            </p>

            ${event ? `
            <!-- Event Special Offer -->
            <div style="background:linear-gradient(135deg,#FEF3C7,#FDE68A);border:2px solid #F59E0B;border-radius:12px;padding:24px;margin:0 0 30px;">
              <p style="color:#92400E;font-size:13px;font-weight:700;margin:0 0 8px;letter-spacing:2px;text-transform:uppercase;">🎊 Special Timing! ${event.emoji} ${event.name} Sale is LIVE!</p>
              <p style="color:#78350F;font-size:15px;margin:0 0 12px;">Use code below for <strong>${event.discount}% OFF</strong> right now!</p>
              <div style="background:#fff;border:1px solid #F59E0B;border-radius:8px;padding:12px;display:inline-block;">
                <span style="font-size:28px;font-weight:900;color:#065f46;letter-spacing:5px;font-family:monospace;">${event.coupon}</span>
              </div>
            </div>
            ` : `
            <!-- Default Welcome Coupon -->
            <div style="background:linear-gradient(135deg,#F0FDF4,#DCFCE7);border:2px dashed #16a34a;border-radius:12px;padding:24px;margin:0 0 30px;">
              <p style="color:#15803d;font-size:13px;font-weight:700;margin:0 0 8px;letter-spacing:2px;text-transform:uppercase;">🎁 Welcome Gift</p>
              <p style="color:#166534;font-size:15px;margin:0 0 12px;">Use this code to get <strong>10% OFF</strong> your first order!</p>
              <div style="background:#fff;border:1px solid #86efac;border-radius:8px;padding:12px;display:inline-block;">
                <span style="font-size:28px;font-weight:900;color:#065f46;letter-spacing:5px;font-family:monospace;">VASTRA10</span>
              </div>
            </div>
            `}

            <a href="https://vastrakuteer.in/shop" style="display:inline-block;background:linear-gradient(135deg,#065f46,#0d9488);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:16px;font-weight:700;letter-spacing:1px;">
              Start Shopping →
            </a>
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

module.exports = { buildFlashEmail, buildWelcomeEmail };
