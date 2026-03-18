import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:5000/api/v1';

async function testRestriction() {
    try {
        console.log('Testing artist email restriction...');
        const response = await axios.post(`${API_URL}/auth/register`, {
            email: 'alice@example.com', // Restricted in .env
            password: 'password123',
            role: 'client',
            username: 'testclient',
            fullName: 'Test Client'
        });
        console.log('FAIL: Registration succeeded even though it should have been restricted.');
        console.log(response.data);
    } catch (error) {
        if (error.response && error.response.status === 400 && error.response.data.message === 'This email is reserved for artist accounts only.') {
            console.log('SUCCESS: Registration blocked as expected with correct message.');
        } else {
            console.log('FAIL: Registration blocked but with unexpected error.');
            console.log(error.response ? error.response.data : error.message);
        }
    }
}

testRestriction();
