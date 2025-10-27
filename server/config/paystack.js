const Paystack = require('paystack');

// Initialize Paystack with secret key
const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);

// Paystack configuration
const paystackConfig = {
  // Test keys (for development)
  test: {
    publicKey: process.env.PAYSTACK_PUBLIC_KEY_TEST || 'pk_test_your_test_public_key',
    secretKey: process.env.PAYSTACK_SECRET_KEY_TEST || 'sk_test_your_test_secret_key',
    baseUrl: 'https://api.paystack.co'
  },
  // Live keys (for production)
  live: {
    publicKey: process.env.PAYSTACK_PUBLIC_KEY_LIVE || 'pk_live_your_live_public_key',
    secretKey: process.env.PAYSTACK_SECRET_KEY_LIVE || 'sk_live_your_live_secret_key',
    baseUrl: 'https://api.paystack.co'
  }
};

// Get current environment configuration
const getCurrentConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? paystackConfig.live : paystackConfig.test;
};

// Initialize Paystack instance based on environment
const initializePaystack = () => {
  const config = getCurrentConfig();
  return Paystack(config.secretKey);
};

module.exports = {
  paystack: initializePaystack(),
  config: getCurrentConfig(),
  getCurrentConfig,
  initializePaystack
};
