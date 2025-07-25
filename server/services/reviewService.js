const Review = require('../models/Review');
const Order = require('../models/Order');
const User = require('../models/User');
const Cake = require('../models/Cake');

exports.addReview = async ({ cakeId, userId, rating, comment, orderId, sellerId, sellerRating, sellerComment }) => {
  // Order-level review (no cakeId or sellerId)
  if (!cakeId && !sellerId && orderId && rating) {
    console.log('Order review branch hit', { userId, orderId, rating, comment });
    // Only allow one order review per user per order
    const existingOrderReview = await Review.findOne({ user: userId, order: orderId, isOrderReview: true });
    if (existingOrderReview) {
      console.log('Order review already exists for this user/order');
      throw new Error('You have already reviewed this order.');
    }
    // Check that the order is delivered and belongs to the user
    const deliveredOrder = await Order.findOne({ _id: orderId, user: userId, status: 'delivered' });
    if (!deliveredOrder) {
      console.log('Order not delivered or not found', { orderId, userId });
      throw new Error('You can only review delivered orders.');
    }
    // Create the order review
    const review = await Review.create({ user: userId, order: orderId, rating, comment, isOrderReview: true });
    console.log('Order review created', review);
    // For each cake in the order, if the user has not reviewed that cake for this order, create a fallback review
    for (const item of deliveredOrder.items) {
      const cakeId = item.cake;
      const existingCakeReview = await Review.findOne({ user: userId, order: orderId, cake: cakeId });
      if (!existingCakeReview) {
        await Review.create({ cake: cakeId, user: userId, order: orderId, rating, comment, isOrderReview: false });
      }
    }
    return review;
  }
  // Seller review (no cakeId, has sellerId)
  if (!cakeId && sellerId && sellerRating && orderId) {
    // Only allow one seller review per order per user
    const existingSellerReview = await Review.findOne({ user: userId, order: orderId, seller: sellerId });
    if (existingSellerReview) {
      console.log('Seller review already exists for this user/order');
      throw new Error('You have already reviewed this seller for this order.');
    }
    // Check that the order is delivered and belongs to the user
    const deliveredOrder = await Order.findOne({ _id: orderId, user: userId, status: 'delivered' });
    if (!deliveredOrder) {
      console.log('Order not delivered or not found for seller review', { orderId, userId });
      throw new Error('You can only review sellers for delivered orders.');
    }
    const sellerReview = await Review.create({ seller: sellerId, user: userId, rating: sellerRating, comment: sellerComment, order: orderId });
    console.log('Seller review created', sellerReview);
    return sellerReview;
  }
  // Cake review (optional)
  if (cakeId && rating && orderId) {
    // Check if the user has a delivered order containing the cake
    const deliveredOrder = await Order.findOne({
      _id: orderId,
      user: userId,
      status: 'delivered',
      'items.cake': cakeId
    });
    if (!deliveredOrder) {
      console.log('Order not delivered or cake not found in order', { orderId, userId, cakeId });
      throw new Error('You can only review cakes you have received in a delivered order.');
    }
    // Only allow one cake review per user per cake per order
    const existingCakeReview = await Review.findOne({ user: userId, order: orderId, cake: cakeId });
    if (existingCakeReview) {
      console.log('Cake review already exists for this user/order/cake');
      throw new Error('You have already reviewed this cake for this order.');
    }
    const cakeReview = await Review.create({ cake: cakeId, user: userId, rating, comment, order: orderId });
    console.log('Cake review created', cakeReview);
    return cakeReview;
  }
  throw new Error('Invalid review payload');
};

exports.getCakeReviews = async (cakeId) => {
  // Get all cake-specific reviews
  const cakeReviews = await Review.find({ cake: cakeId }).populate('user', 'name');
  // Find all orders that included this cake
  const ordersWithCake = await Order.find({ 'items.cake': cakeId, status: 'delivered' });
  // For each order, check if the user has a cake-specific review; if not, get their order review
  const fallbackOrderReviews = [];
  for (const order of ordersWithCake) {
    const userId = order.user;
    const hasCakeReview = await Review.findOne({ cake: cakeId, user: userId, order: order._id });
    if (!hasCakeReview) {
      const orderReview = await Review.findOne({ order: order._id, user: userId, isOrderReview: true });
      if (orderReview) {
        // Attach user info for consistency
        const populatedOrderReview = await orderReview.populate('user', 'name');
        fallbackOrderReviews.push(populatedOrderReview);
      }
    }
  }
  // Combine and return unique reviews (avoid duplicates)
  const allReviews = [...cakeReviews, ...fallbackOrderReviews];
  // Remove duplicates by user+order
  const uniqueReviews = [];
  const seen = new Set();
  for (const review of allReviews) {
    const key = review.user._id.toString() + '-' + (review.order ? review.order.toString() : '');
    if (!seen.has(key)) {
      uniqueReviews.push(review);
      seen.add(key);
    }
  }
  return uniqueReviews;
};

exports.getUserReviews = async (userId) => {
  return await Review.find({ user: userId }).populate('cake', 'name');
};

exports.deleteReview = async (reviewId, userId, isAdmin = false) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new Error('Review not found');
  if (!isAdmin && review.user.toString() !== userId.toString()) {
    throw new Error('Not authorized');
  }
  await review.deleteOne();
  return { message: 'Review deleted' };
};

exports.getSellerReviews = async (sellerId) => {
  // Find all cakes created by this seller
  const cakes = await Cake.find({ createdBy: sellerId }, '_id');
  const cakeIds = cakes.map(cake => cake._id);
  // Find all reviews for these cakes
  const reviews = await Review.find({ cake: { $in: cakeIds } })
    .populate('user', 'name')
    .populate('cake', 'name')
    .populate({
      path: 'order',
      populate: {
        path: 'items.cake',
        model: 'Cake',
        select: 'name price',
      },
    });
  return reviews;
};

exports.getSellerOrderReviews = async (sellerId) => {
  // Find all cakes created by this seller
  const cakes = await Cake.find({ createdBy: sellerId }, '_id');
  const cakeIds = cakes.map(cake => cake._id);
  // Find all delivered orders that include at least one of the seller's cakes
  const orders = await Order.find({ 'items.cake': { $in: cakeIds }, status: 'delivered' });
  const orderIds = orders.map(order => order._id);
  // Find all order-level reviews for these orders
  const reviews = await Review.find({ order: { $in: orderIds }, isOrderReview: true })
    .populate('user', 'name')
    .populate({
      path: 'order',
      populate: {
        path: 'items.cake',
        model: 'Cake',
        select: 'name price',
      },
    });
  return reviews;
};