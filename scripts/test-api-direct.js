const axios = require('axios');
require('dotenv').config({ path: './config.env' });

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(method, endpoint, data = null) {
    try {
        console.log(`\nTesting ${method} ${endpoint}...`);
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            withCredentials: true,
            validateStatus: () => true,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        return response;
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Status:', error.response.status);
        }
        throw error;
    }
}

async function runTests() {
    console.log('Starting API tests...');
    
    // Test signup
    await testEndpoint('POST', '/api/v1/auth/signup', {
        name: 'Admin User',
        email: 'shannu@admin.com',
        password: '667700',
        passwordConfirm: '667700',
        role: 'admin',
        phone: '+1234567890',
        isVerified: true,
        active: true
    });

    // Test login
    const loginResponse = await testEndpoint('POST', '/api/v1/auth/login', {
        email: 'shannu@admin.com',
        password: '667700'
    });

    // If login successful, test protected route
    if (loginResponse.status === 200) {
        const token = loginResponse.data.token;
        console.log('\nLogin successful! Token:', token);
        
        // Test protected route
        await testEndpoint('GET', '/api/v1/users/me', null, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    console.log('\nAll tests completed!');
}

// Run the tests
runTests().catch(console.error);
