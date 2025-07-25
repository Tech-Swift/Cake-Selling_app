const orderService = require('../services/orderService');

// Place an order (from cart or direct)
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, address, paymentMethod } = req.body; // include address and paymentMethod
    const order = await orderService.placeOrder({ userId, items, address, paymentMethod });
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all orders for the logged-in user
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderService.getUserOrders(userId);
    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get a single order by ID (for the user)
exports.getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    const order = await orderService.getOrderById(orderId, userId);
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all orders for the logged-in seller
exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const orders = await orderService.getSellerOrders(sellerId);
    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get sales stats for the logged-in seller
exports.getSellerSalesStats = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const orders = await require('../services/orderService').getSellerOrders(sellerId);
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    let totalCakesSold = 0;
    const cakeSalesMap = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        totalCakesSold += item.quantity;
        const cakeName = item.cake?.name || 'Unknown';
        cakeSalesMap[cakeName] = (cakeSalesMap[cakeName] || 0) + item.quantity;
      });
    });
    const chartData = Object.entries(cakeSalesMap).map(([cakeName, sold]) => ({ cakeName, sold }));

    // Delivered orders only
    const deliveredOrdersArr = orders.filter(order => order.status === 'delivered');
    console.log('Delivered orders for seller:', deliveredOrdersArr.map(o => ({id: o._id, status: o.status, totalAmount: o.totalAmount})));
    const deliveredOrders = deliveredOrdersArr.length;
    const deliveredRevenue = deliveredOrdersArr.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    let deliveredCakesSold = 0;
    const deliveredCakeSalesMap = {};
    deliveredOrdersArr.forEach(order => {
      order.items.forEach(item => {
        deliveredCakesSold += item.quantity;
        const cakeName = item.cake?.name || 'Unknown';
        deliveredCakeSalesMap[cakeName] = (deliveredCakeSalesMap[cakeName] || 0) + item.quantity;
      });
    });
    const deliveredChartData = Object.entries(deliveredCakeSalesMap).map(([cakeName, sold]) => ({ cakeName, sold }));

    res.json({
      totalOrders,
      totalRevenue,
      totalCakesSold,
      chartData,
      deliveredOrders,
      deliveredRevenue,
      deliveredCakesSold,
      deliveredChartData
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update order status (admin or seller)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const allowedStatuses = ['pending', 'accepted', 'on_progress', 'ready', 'picked', 'delivered'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const order = await orderService.updateOrderStatus(orderId, status);
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete an order (admin only)
exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await orderService.deleteOrder(orderId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};