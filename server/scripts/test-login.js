import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

async function testLogin() {
    try {
        console.log('Testing login endpoint...');
        // First, check if server is up
        await axios.get(`${API_URL}/categories`);
        console.log('Server is UP. Attempting login...');
        
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: 'alice@example.com',
            password: 'password123'
        });
        console.log('Login succeeded:', response.data.message);
    } catch (error) {
        console.log('LOGIN ERROR:', error.response ? error.response.status : error.message);
        if (error.response) {
            console.log('ERROR DATA:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testLogin();
