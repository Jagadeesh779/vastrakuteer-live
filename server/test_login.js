const API_URL = 'http://localhost:5000/api/auth/login';

async function testLogin() {
    try {
        console.log(`Attempting login to ${API_URL}...`);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@jaggu.kutter.com',
                password: 'jaggu'
            })
        });

        const data = await response.json();
        console.log('Status Code:', response.status);
        console.log('Response:', data);
    } catch (error) {
        console.log('Error:', error.message);
    }
}

testLogin();
