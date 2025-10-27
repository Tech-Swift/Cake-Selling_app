const cartService = require('../services/cartService');
const orderService = require('../services/orderService');
const paymentService = require('../services/paymentService');

// Get payment options (countries and methods)
exports.getPaymentOptions = async (req, res) => {
  try {
    const paymentOptions = {
      methods: [
        {
          id: 'cash_on_delivery',
          name: 'Cash on Delivery',
          description: 'Pay when your order is delivered',
          available: true
        },
        {
          id: 'online_payment',
          name: 'Online Payment',
          description: 'Pay securely online',
          available: true
        }
      ],
      countries: [
        {
          id: 'Nigeria',
          name: 'Nigeria',
          currency: 'NGN',
          gateway: 'paystack',
          available: true
        },
        {
          id: 'Ghana',
          name: 'Ghana',
          currency: 'GHS',
          gateway: 'paystack',
          available: true
        },
        {
          id: 'Kenya',
          name: 'Kenya',
          currency: 'KES',
          gateway: 'paystack',
          available: true
        },
        {
          id: 'South Africa',
          name: 'South Africa',
          currency: 'ZAR',
          gateway: 'paystack',
          available: true
        },
        {
          id: 'Egypt',
          name: 'Egypt',
          currency: 'EGP',
          gateway: 'paystack',
          available: true
        },
        {
          id: 'Rwanda',
          name: 'Rwanda',
          currency: 'RWF',
          gateway: 'paystack',
          available: true
        },
        {
          id: 'Côte d\'Ivoire',
          name: 'Côte d\'Ivoire',
          currency: 'XOF',
          gateway: 'paystack',
          available: true
        }
      ]
    };

    res.status(200).json({
      success: true,
      data: paymentOptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get cart summary for checkout
exports.getCartSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartService.getUserCart(userId);
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    const itemsWithPrice = cart.items.map(item => {
      const itemTotal = item.cake.price * item.quantity;
      totalAmount += itemTotal;
      return {
        cake: item.cake,
        quantity: item.quantity,
        price: item.cake.price,
        total: itemTotal
      };
    });

    res.status(200).json({
      success: true,
      data: {
        cartId: cart._id,
        items: itemsWithPrice,
        totalAmount: totalAmount,
        itemCount: cart.items.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Process checkout with payment method
exports.processCheckout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      shippingAddress, 
      paymentMethod, 
      paymentCountry,
      email 
    } = req.body;

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Shipping address and payment method are required'
      });
    }

    if (paymentMethod === 'online_payment' && !paymentCountry) {
      return res.status(400).json({
        success: false,
        error: 'Payment country is required for online payment'
      });
    }

    if (paymentMethod === 'online_payment' && !email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required for online payment'
      });
    }

    // Get cart and calculate total
    const cart = await cartService.getUserCart(userId);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = cart.items.map(item => {
      const itemTotal = item.cake.price * item.quantity;
      totalAmount += itemTotal;
      return {
        cake: item.cake._id,
        quantity: item.quantity,
        price: item.cake.price
      };
    });

    // Create order
    const orderData = {
      user: userId,
      items: orderItems,
      totalAmount: totalAmount,
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending'
    };

    // Add payment country and gateway for online payment
    if (paymentMethod === 'online_payment') {
      orderData.paymentCountry = paymentCountry;
      orderData.paymentGateway = 'paystack'; // Default to Paystack for now
    }

    const order = await orderService.createOrder(orderData);

    // Handle payment based on method
    if (paymentMethod === 'cash_on_delivery') {
      // For COD, just clear the cart and return success
      await cartService.clearCart(userId);
      
      res.status(201).json({
        success: true,
        message: 'Order placed successfully. You will pay on delivery.',
        data: {
          order: order,
          paymentMethod: 'cash_on_delivery',
          nextStep: 'order_confirmed'
        }
      });
    } else if (paymentMethod === 'online_payment') {
      // Initialize online payment
      const paymentResult = await paymentService.initializePayment({
        orderId: order._id,
        userId: userId,
        email: email,
        amount: totalAmount,
        metadata: {
          paymentCountry: paymentCountry,
          paymentGateway: 'paystack',
          customerName: req.user.name
        }
      });

      // Update order with payment reference
      order.paymentReference = paymentResult.reference;
      await order.save();

      res.status(201).json({
        success: true,
        message: 'Payment initialized successfully',
        data: {
          order: order,
          paymentMethod: 'online_payment',
          paymentCountry: paymentCountry,
          nextStep: 'payment_required',
          authorizationUrl: paymentResult.authorizationUrl,
          reference: paymentResult.reference,
          amount: totalAmount,
          currencyConversion: paymentResult.currencyConversion
        }
      });
    }

  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Verify payment after completion
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    
    if (!reference) {
      return res.status(400).json({
        success: false,
        error: 'Payment reference is required',
        message: 'Please provide a valid payment reference'
      });
    }

    console.log(`Verifying payment with reference: ${reference}`);

    // First, try to find the payment record
    const payment = await paymentService.getPaymentByReference(reference);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
        message: 'No payment found with this reference. Please check your payment reference.',
        reference: reference
      });
    }

    console.log(`Payment found: ${payment._id}, Status: ${payment.status}`);

    // If payment is already verified, return current status
    if (payment.status === 'paid') {
      const order = await orderService.getOrderById(payment.order);
      
      return res.status(200).json({
        success: true,
        message: 'Payment already verified successfully',
        paymentStatus: 'success',
        data: {
          order: order,
          payment: payment,
          orderStatus: order.status,
          paymentStatus: order.paymentStatus,
          canCheckout: true,
          nextStep: 'order_confirmed'
        }
      });
    }

    // If payment failed previously, return failure status
    if (payment.status === 'failed') {
      const order = await orderService.getOrderById(payment.order);
      
      return res.status(400).json({
        success: false,
        message: 'Payment failed',
        paymentStatus: 'failed',
        error: 'Payment was not successful',
        data: {
          order: order,
          payment: payment,
          orderStatus: order.status,
          paymentStatus: order.paymentStatus,
          canCheckout: false,
          nextStep: 'payment_failed',
          retryPayment: true
        }
      });
    }

    // Verify payment with Paystack
    const result = await paymentService.verifyPayment(reference);
    
    if (result.success) {
      // Payment successful
      console.log(`Payment verification successful for reference: ${reference}`);
      
      // Clear cart after successful payment
      await cartService.clearCart(result.payment.user);
      
      // Get updated order
      const order = await orderService.getOrderById(result.payment.order);
      
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully! Your order has been confirmed.',
        paymentStatus: 'success',
        data: {
          order: order,
          payment: result.payment,
          transaction: result.transaction,
          orderStatus: order.status,
          paymentStatus: order.paymentStatus,
          paymentId: result.payment.transactionId,
          canCheckout: true,
          nextStep: 'order_confirmed',
          redirectUrl: '/order-success'
        }
      });
    } else {
      // Payment failed
      console.log(`Payment verification failed for reference: ${reference}`);
      
      // Get order for failed payment
      const order = await orderService.getOrderById(result.payment.order);
      
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        paymentStatus: 'failed',
        error: 'Payment was not successful. Please try again.',
        data: {
          order: order,
          payment: result.payment,
          transaction: result.transaction,
          orderStatus: order.status,
          paymentStatus: order.paymentStatus,
          canCheckout: false,
          nextStep: 'payment_failed',
          retryPayment: true,
          redirectUrl: '/payment-failed'
        }
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    
    // Handle specific error cases
    if (error.message.includes('Payment not found')) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
        message: 'No payment found with this reference. Please check your payment reference.',
        reference: req.params.reference
      });
    }
    
    if (error.message.includes('Payment verification failed')) {
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed',
        message: 'Unable to verify payment. Please contact support if this persists.',
        reference: req.params.reference,
        retryPayment: true
      });
    }
    
    // Generic error
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while verifying payment. Please try again later.',
      reference: req.params.reference
    });
  }
};

// Get order status
exports.getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    
    const order = await orderService.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        message: 'No order found with this ID'
      });
    }

    // Check if user owns this order
    if (order.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only view your own orders'
      });
    }

    // Determine checkout status based on payment method and status
    let canCheckout = false;
    let nextStep = '';
    let redirectUrl = '';

    if (order.paymentMethod === 'cash_on_delivery') {
      canCheckout = true;
      nextStep = 'order_confirmed';
      redirectUrl = '/order-success';
    } else if (order.paymentMethod === 'online_payment') {
      if (order.paymentStatus === 'paid') {
        canCheckout = true;
        nextStep = 'order_confirmed';
        redirectUrl = '/order-success';
      } else if (order.paymentStatus === 'failed') {
        canCheckout = false;
        nextStep = 'payment_failed';
        redirectUrl = '/payment-failed';
      } else {
        canCheckout = false;
        nextStep = 'payment_pending';
        redirectUrl = '/payment-pending';
      }
    }

    res.status(200).json({
      success: true,
      message: 'Order status retrieved successfully',
      data: {
        order: order,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        paymentCountry: order.paymentCountry,
        paymentReference: order.paymentReference,
        canCheckout: canCheckout,
        nextStep: nextStep,
        redirectUrl: redirectUrl,
        orderDate: order.createdAt,
        totalAmount: order.totalAmount,
        itemCount: order.items.length
      }
    });
  } catch (error) {
    console.error('Get order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while retrieving order status'
    });
  }
};

