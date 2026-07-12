// test-api.js - Run this to test your API
const axios = require('axios');

async function testAPI() {
  console.log('🧪 Testing API routes...\n');

  // Test 1: Check if server is running
  try {
    const response = await axios.get('http://localhost:5000/api/test');
    console.log('✅ Server is running:', response.data);
  } catch (error) {
    console.log('❌ Server not responding:', error.message);
    return;
  }

  // Test 2: Test registration
  try {
    const testEmail = `test${Date.now()}@example.com`;
    console.log(`\n📝 Testing registration with: ${testEmail}`);
    
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name: "Test User",
      email: testEmail,
      password: "Test@123",
      college: "Test College",
      department: "Computer Science",
      year: "1st"
    });
    
    console.log('✅ Registration successful!');
    console.log('📋 Response:', response.data);
    console.log('🎯 Token:', response.data.token ? 'Received ✅' : 'Not received ❌');
  } catch (error) {
    console.log('❌ Registration failed:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Message:', error.response.data.message);
    } else {
      console.log('   Error:', error.message);
    }
  }
}

testAPI();