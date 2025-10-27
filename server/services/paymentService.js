const Payment = require('../models/Payment');
const Order = require('../models/Order');
const notificationService = require('./notificationService');
const { paystack, config } = require('../config/paystack');

// Initialize Paystack payment
exports.initializePayment = async ({ orderId, userId, email, amount, metadata = {} }) => {
  try {
    // Convert amount to kobo (Paystack expects amount in kobo)
    const amountInKobo = Math.round(amount * 100);
    
    // Create payment record first
    const payment = new Payment({
      order: orderId,
      user: userId,
      amount: amount,
      method: 'paystack',
      status: 'pending'
    });
    await payment.save();

    // Currency mapping
    const currencyMap = {
      'Nigeria': 'NGN',
      'Ghana': 'GHS', 
      'Kenya': 'KES',
      'South Africa': 'ZAR',
      'Egypt': 'EGP',
      'Rwanda': 'RWF',
      'Côte d\'Ivoire': 'XOF'
    };
    
    // Currency conversion rates (to KES - Kenyan Shilling)
    // These are approximate rates - in production, use real-time exchange rates
    const currencyRates = {
      'NGN': 0.25,  // 1 NGN = 0.25 KES
      'GHS': 8.5,   // 1 GHS = 8.5 KES
      'KES': 1,     // 1 KES = 1 KES (base currency)
      'ZAR': 7.2,   // 1 ZAR = 7.2 KES
      'EGP': 0.4,   // 1 EGP = 0.4 KES
      'RWF': 0.003, // 1 RWF = 0.003 KES
      'XOF': 0.0015 // 1 XOF = 0.0015 KES
    };
    
    // Convert amount to KES
    const originalCurrency = metadata.paymentCountry || 'Nigeria';
    const currencyCode = currencyMap[originalCurrency] || 'NGN';
    const exchangeRate = currencyRates[currencyCode] || 0.25; // Default to NGN rate
    const amountInKES = Math.round(amount * exchangeRate);
    const amountInKESKobo = Math.round(amountInKES * 100); // Convert to kobo for KES
    
    console.log(`Currency conversion: ${amount} ${currencyCode} = ${amountInKES} KES (${amountInKESKobo} kobo)`);
    
    // Initialize Paystack transaction with KES
    const paystackResponse = await paystack.transaction.initialize({
      email: email,
      amount: amountInKESKobo,
      currency: 'KES', // Always use KES for Paystack
      reference: `cake_order_${orderId}_${payment._id}`,
      metadata: {
        orderId: orderId.toString(),
        paymentId: payment._id.toString(),
        userId: userId.toString(),
        originalAmount: amount,
        originalCurrency: currencyCode,
        convertedAmount: amountInKES,
        convertedCurrency: 'KES',
        exchangeRate: exchangeRate,
        ...metadata
      },
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback`,
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
    });

    if (paystackResponse.status) {
      // Update payment with Paystack reference
      payment.paystackReference = paystackResponse.data.reference;
      payment.authorizationUrl = paystackResponse.data.authorization_url;
      await payment.save();

      return {
        payment,
        authorizationUrl: paystackResponse.data.authorization_url,
        accessCode: paystackResponse.data.access_code,
        reference: paystackResponse.data.reference,
        currencyConversion: {
          originalAmount: amount,
          originalCurrency: currencyCode,
          convertedAmount: amountInKES,
          convertedCurrency: 'KES',
          exchangeRate: exchangeRate
        }
      };
    } else {
      throw new Error('Failed to initialize Paystack payment');
    }
  } catch (error) {
    console.error('Paystack initialization error:', error);
    throw new Error(`Payment initialization failed: ${error.message}`);
  }
};

// Verify Paystack payment
exports.verifyPayment = async (reference) => {
  try {
    const paystackResponse = await paystack.transaction.verify(reference);
    
    if (paystackResponse.status) {
      const transaction = paystackResponse.data;
      
      // Find payment by reference
      const payment = await Payment.findOne({ paystackReference: reference });
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Update payment status
      payment.status = transaction.status === 'success' ? 'paid' : 'failed';
      payment.transactionId = transaction.id;
      payment.paidAt = transaction.status === 'success' ? new Date() : null;
      payment.paystackData = transaction;
      await payment.save();

      // If payment successful, update order and send notification
      if (transaction.status === 'success') {
        await Order.findByIdAndUpdate(payment.order, { 
          status: 'confirmed',
          paymentStatus: 'paid'
        });

        await notificationService.createNotification({
          user: payment.user,
          type: 'payment',
          message: `Your payment of ₦${payment.amount} has been confirmed.`,
          data: { 
            paymentId: payment._id, 
            orderId: payment.order,
            transactionId: transaction.id
          }
        });
      }

      return {
        payment,
        transaction,
        success: transaction.status === 'success'
      };
    } else {
      throw new Error('Payment verification failed');
    }
  } catch (error) {
    console.error('Paystack verification error:', error);
    throw new Error(`Payment verification failed: ${error.message}`);
  }
};

// Handle Paystack webhook
exports.handleWebhook = async (eventData) => {
  try {
    const { event, data } = eventData;
    
    if (event === 'charge.success') {
      const reference = data.reference;
      return await this.verifyPayment(reference);
    }
    
    return { success: true, message: 'Webhook processed' };
  } catch (error) {
    console.error('Webhook processing error:', error);
    throw error;
  }
};

// Get payment by reference
exports.getPaymentByReference = async (reference) => {
  const payment = await Payment.findOne({ paystackReference: reference }).populate('order user');
  return payment;
};

// Get payment status
exports.getPaymentStatus = async (paymentId) => {
  const payment = await Payment.findById(paymentId).populate('order user');
  if (!payment) {
    throw new Error('Payment not found');
  }
  return payment;
};

// Create payment (legacy method - kept for backward compatibility)
exports.createPayment = async ({ orderId, userId, amount, method }) => {
  const payment = new Payment({
    order: orderId,
    user: userId,
    amount,
    method,
    status: 'pending'
  });
  await payment.save();
  return payment;
};

// Mark payment as paid (legacy method - kept for backward compatibility)
exports.markPaymentAsPaid = async (paymentId, transactionId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error('Payment not found');
  payment.status = 'paid';
  payment.transactionId = transactionId;
  payment.paidAt = new Date();
  await payment.save();
  
  await notificationService.createNotification({
    user: payment.user,
    type: 'payment',
    message: `Your payment of ₦${payment.amount} has been confirmed.`,
    data: { paymentId: payment._id, orderId: payment.order }
  });

  await Order.findByIdAndUpdate(payment.order, { status: 'confirmed' });
  return payment;
};