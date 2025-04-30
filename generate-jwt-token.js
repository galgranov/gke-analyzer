const jwt = require('jsonwebtoken');

// Configuration (matching the application's defaults)
const JWT_SECRET = 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '1d';

// Sample user payload
const payload = {
  sub: '65f1a2b3c4d5e6f7a8b9c0d1', // Sample user ID (MongoDB ObjectId format)
  username: 'testuser',
  isTestToken: true // Special flag for testing
};

// Generate the token
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

console.log('Sample JWT Token for Swagger testing:');
console.log(token);
console.log('\nTo use in Swagger:');
console.log('1. Click the "Authorize" button at the top of the Swagger UI');
console.log('2. In the "Value" field, enter: Bearer ' + token);
console.log('3. Click "Authorize" and close the dialog');
console.log('4. Now you can test the protected endpoints');
