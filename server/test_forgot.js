const axios = require('axios');

async function testForgotPassword() {
    try {
        console.log("Testing forgot password for admin@vastrakuteer.com...");
        const res = await axios.post('http://localhost:5000/api/auth/forgot-password', {
            email: 'admin@vastrakuteer.com'
        });
        console.log("Response:", res.data);
    } catch (err) {
        if (err.response) {
            console.error("Server Error Response:", err.response.data);
        } else {
            console.error("Request Error:", err.message);
        }
    }
}

testForgotPassword();
