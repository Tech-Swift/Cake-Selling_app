const fs = require('fs');
const path = require('path');

console.log('🔧 Environment Setup Helper');
console.log('==========================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file already exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('Current .env content:');
  console.log(envContent);
} else {
  console.log('❌ .env file not found');
  console.log('Creating .env file...\n');
  
  const envTemplate = `# Environment
NODE_ENV=development

# Database (Replace with your MongoDB connection string)
MONGO_URI_PRODUCTION=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database

# JWT (Replace with a secure secret key)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port (optional)
PORT=5000

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:5173,https://cake-selling-app.onrender.com
`;

  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env file created successfully!');
  console.log('📝 Please edit the .env file with your actual values:\n');
  console.log(envTemplate);
}

console.log('\n📋 How to set NODE_ENV:');
console.log('========================');
console.log('1. In .env file: NODE_ENV=development');
console.log('2. In terminal: export NODE_ENV=development');
console.log('3. In package.json script: "start": "NODE_ENV=production node app.js"');
console.log('4. In deployment (Render): Set in environment variables');

console.log('\n🌍 Environment Modes:');
console.log('====================');
console.log('- development: For local development');
console.log('- production: For deployment');
console.log('- test: For testing');

console.log('\n🚀 To run both localhost and deployment:');
console.log('=====================================');
console.log('1. Local: NODE_ENV=development (default)');
console.log('2. Deployment: NODE_ENV=production (set in Render)');
console.log('3. Both can run simultaneously with different NODE_ENV values'); 