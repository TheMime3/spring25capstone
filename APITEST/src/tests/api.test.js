import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000';
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: `test${Date.now()}@example.com`,
  password: 'password123'
};

let accessToken;
let refreshToken;

async function testHealthCheck() {
  console.log('\n🧪 Testing Health Check...');
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    
    if (response.ok && data.status === 'ok') {
      console.log('✅ API is healthy');
      console.log('Database:', data.database);
      return true;
    } else {
      console.log('❌ Health check failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return false;
  }
}

async function testRegistration() {
  console.log('\n🧪 Testing Registration...');
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful');
      console.log('User ID:', data.user.id);
      accessToken = data.accessToken;
      refreshToken = data.refreshToken;
      return true;
    } else {
      console.log('❌ Registration failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Registration error:', error);
    return false;
  }
}

async function testDuplicateEmail() {
  console.log('\n🧪 Testing Duplicate Email Registration...');
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    
    if (!response.ok && data.message === 'Email already registered') {
      console.log('✅ Duplicate email check passed');
      return true;
    } else {
      console.log('❌ Duplicate email check failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Duplicate email test error:', error);
    return false;
  }
}

async function testLogin() {
  console.log('\n🧪 Testing Login...');
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful');
      console.log('User:', data.user.firstName, data.user.lastName);
      accessToken = data.accessToken;
      refreshToken = data.refreshToken;
      return true;
    } else {
      console.log('❌ Login failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error);
    return false;
  }
}

async function testInvalidLogin() {
  console.log('\n🧪 Testing Invalid Login...');
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'wrongpassword'
      })
    });
    
    const data = await response.json();
    
    if (response.status === 401 && data.message === 'Invalid credentials') {
      console.log('✅ Invalid login check passed');
      return true;
    } else {
      console.log('❌ Invalid login check failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Invalid login test error:', error);
    return false;
  }
}

async function testLogout() {
  console.log('\n🧪 Testing Logout...');
  try {
    if (!refreshToken) {
      console.log('❌ No refresh token available for logout');
      return false;
    }

    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ refreshToken })
    });
    
    if (response.ok) {
      console.log('✅ Logout successful');
      return true;
    } else {
      const data = await response.json();
      console.log('❌ Logout failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Logout test error:', error);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  // First check if the API is running
  const isHealthy = await testHealthCheck();
  if (!isHealthy) {
    console.log('\n❌ API is not running or database is not connected. Please start the API first.');
    process.exit(1);
    return;
  }
  
  // Run all tests
  const tests = [
    { name: 'Registration', fn: testRegistration },
    { name: 'Duplicate Email', fn: testDuplicateEmail },
    { name: 'Login', fn: testLogin },
    { name: 'Invalid Login', fn: testInvalidLogin },
    { name: 'Logout', fn: testLogout }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const success = await test.fn();
    if (success) {
      passed++;
    } else {
      failed++;
      console.log(`\n❌ ${test.name} test failed`);
    }
  }

  console.log('\n📊 Test Summary:');
  console.log(`Total Tests: ${tests.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed successfully!');
    process.exit(0);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});