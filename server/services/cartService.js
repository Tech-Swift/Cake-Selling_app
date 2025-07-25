const Cart = require('../models/Cart');
const Cake = require('../models/Cake');

exports.addToCart = async (userId, cakeId) => {
  const cake = await Cake.findById(cakeId);
  if (!cake) throw new Error('Cake not found');

  let cart = await Cart.findOne({ user: userId }).populate('items.cake');
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  // Single-seller restriction
  if (cart.items.length > 0) {
    const existingCake = cart.items[0].cake;
    if (!existingCake.createdBy) {
      console.error('Cart item missing createdBy:', existingCake);
      throw new Error('Cart item is missing seller information. Please contact support.');
    }
    if (!cake.createdBy) {
      console.error('Cake being added missing createdBy:', cake);
      throw new Error('Cake is missing seller information. Please contact support.');
    }
    const existingSeller = existingCake.createdBy.toString();
    const newSeller = cake.createdBy.toString();
    console.log('Comparing sellers:', { existingSeller, newSeller });
    if (newSeller !== existingSeller) {
      throw new Error('You can only add cakes from one seller per order.');
    }
  }

  const itemIndex = cart.items.findIndex(item => item.cake._id.toString() === cakeId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += 1;
  } else {
    cart.items.push({ cake: cakeId, quantity: 1 });
  }

  await cart.save();
  return cart;
};

exports.getUserCart = async (userId) => {
  return await Cart.findOne({ user: userId }).populate('items.cake');
};

exports.removeFromCart = async (userId, cakeId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new Error('Cart not found');

  const beforeCount = cart.items.length;

  cart.items = cart.items.filter(item => {
    return item.cake.toString() !== cakeId;
  });

  if (cart.items.length === beforeCount) {
    throw new Error('Cake not found in cart');
  }

  await cart.save();
  return cart;
};


exports.checkoutCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart || cart.items.length === 0) throw new Error('Cart is empty');

  // mock checkout logic
  await Cart.deleteOne({ user: userId });
  return { status: 'success', paidItems: cart.items };
};
