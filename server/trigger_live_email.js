/**
 * Login to live vastrakuteer.in and trigger Akshaya Tritiya email blast
 */

const BASE_URL = 'https://vastrakuteer.in';

async function triggerEmails() {
    console.log('🔐 Logging in to vastrakuteer.in admin...');

    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@vastrakuteer.com',
            password: 'admin123'
        })
    });

    const loginData = await loginRes.json();
    console.log('Login status:', loginRes.status, loginData.message || '');

    if (!loginRes.ok) {
        console.error('❌ Login failed:', JSON.stringify(loginData));
        process.exit(1);
    }

    const token = loginData.token;
    console.log('✅ Logged in as admin!');

    // Trigger Summer Sale email blast
    console.log('\n📨 Sending Summer Sale emails to all users...');

    const emailRes = await fetch(`${BASE_URL}/api/admin/trigger-flash-sale`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        },
        body: JSON.stringify({ eventId: 'summer_sale' })
    });

    const emailData = await emailRes.json();
    console.log('\nStatus:', emailRes.status);
    console.log(JSON.stringify(emailData, null, 2));

    if (emailRes.ok) {
        console.log(`\n🎉 SUCCESS! ${emailData.sent} emails sent for ${emailData.event || 'Summer Sale'}`);
        if (emailData.failed > 0) console.log(`⚠️  ${emailData.failed} failed`);
    } else {
        console.error('❌ Failed:', emailData.message);
    }
}

triggerEmails().catch(err => {
    console.error('Fatal:', err.message);
    process.exit(1);
});
