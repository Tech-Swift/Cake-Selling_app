const Order = require('../models/Order');
const Cake = require('../models/Cake');
const User = require('../models/User');
const Cart = require('../models/Cart');
const notificationService = require('./notificationService');

exports.placeOrder = async ({ userId, items, address, paymentMethod }) => {
  if (!address || !paymentMethod) {
    throw new Error('Address and payment method are required');
  }
  const orderItems = await Promise.all(
    items.map(async ({ cakeId, quantity }) => {
      const cake = await Cake.findById(cakeId);
      if (!cake) throw new Error(`Cake with ID ${cakeId} not found`);
      return { cake: cake._id, quantity };
    })
  );

  const totalAmount = await orderItems.reduce(async (accPromise, item) => {
    const acc = await accPromise;
    const cake = await Cake.findById(item.cake);
    return acc + (cake.price * item.quantity);
  }, Promise.resolve(0));

  const order = new Order({
    user: userId,
    items: orderItems,
    totalAmount,
    status: 'pending',
    address,
    paymentMethod
  });

  await order.save();

  // Clear the user's cart after successful order
  await Cart.deleteOne({ user: userId });

  // Fetch buyer's name
  const buyer = await User.findById(userId);
  const buyerName = buyer?.name || 'A customer';

  //notify the user
  await notificationService.createNotification({
    user: userId,
    type: 'order',
    message: `${buyerName}, your order has been placed. Total amount: ${totalAmount}`,
    data: {orderId: order._id}
  });

  // Notify the seller(s) only once per order
  // Fetch all cakes for the order items
  const cakes = await Promise.all(orderItems.map(item => Cake.findById(item.cake)));
  // Extract unique seller IDs (excluding the buyer)
  const sellerIds = Array.from(new Set(
    cakes
      .filter(cake => cake && cake.createdBy && cake.createdBy.toString() !== userId.toString())
      .map(cake => cake.createdBy.toString())
  ));
  // Send one notification per seller
  for (const sellerId of sellerIds) {
    await notificationService.createNotification({
      user: sellerId,
      type: 'order',
      message: `${buyerName} has placed an order`,
      data: { orderId: order._id }
    });
  }
  
  return order;
};

exports.getUserOrders = async (userId) => {
  return await Order.find({ user: userId })
    .populate('items.cake')
    .sort({ createdAt: -1 });
};

exports.getOrderById = async (orderId, userId) => {
  const order = await Order.findById(orderId).populate('items.cake');
  if (!order) throw new Error('Order not found');
  if (order.user.toString() !== userId.toString()) {
    throw new Error('Unauthorized access to this order');
  }
  return order;
};

exports.getAllOrders = async () => {
  return await Order.find()
    .populate('user')
    .populate('items.cake')
    .sort({ createdAt: -1 });
};

exports.getSellerOrders = async (sellerId) => {
  const allOrders = await Order.find()
    .populate('items.cake')
    .populate('user', 'name email'); // Populates buyer's name and email
  const sellerOrders = allOrders.filter(order =>
    order.items.some(item =>
      item.cake && item.cake.createdBy && item.cake.createdBy.toString() === sellerId.toString()
    )
  );
  return sellerOrders;
};

exports.updateOrderStatus = async (orderId, status) => {
  const order = await Order.findById(orderId).populate('user', 'name');
  if (!order) throw new Error('Order not found');
  order.status = status;
  await order.save();
  
  const buyerName = order.user?.name || 'A customer';

  // Fetch all cakes for the order to get the seller(s)
  const cakes = await Promise.all(order.items.map(item => Cake.findById(item.cake).populate('createdBy', 'name')));
  const sellerNames = Array.from(new Set(
    cakes
      .filter(cake => cake && cake.createdBy)
      .map(cake => cake.createdBy.name || 'the seller')
  ));
  const sellerNamesStr = sellerNames.join(', ');

  //notify user about any update
  await notificationService.createNotification({
    user: order.user._id || order.user,
    type: 'order',
    message: `Your order from ${sellerNamesStr} has been updated to ${status}`,
    data: { orderId: order._id }
  });

  if (status === 'delivered') {
    await notificationService.createNotification({
      user: order.user._id || order.user,
      type: 'review',
      message: `Your order from ${sellerNamesStr} has been delivered successfully!`,
      data: { orderId: order._id }
    });
    // Notify the seller(s) as well
    const sellerIds = Array.from(new Set(
      cakes
        .filter(cake => cake && cake.createdBy && cake.createdBy._id.toString() !== (order.user._id || order.user).toString())
        .map(cake => cake.createdBy._id.toString())
    ));
    for (const sellerId of sellerIds) {
      await notificationService.createNotification({
        user: sellerId,
        type: 'order',
        message: `${buyerName}'s order has been delivered successfully!`,
        data: { orderId: order._id }
      });
    }
  }
  return order;
};

exports.deleteOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');
  await order.deleteOne();
  return { message: 'Order deleted successfully' };
};
