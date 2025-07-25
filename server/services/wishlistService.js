const Wishlist = require('../models/Wishlist');

exports.getWishlist = async (userId) => {
  return await Wishlist.findOne({ user: userId }).populate('items.cake');
};

exports.addToWishlist = async (userId, cakeId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = new Wishlist({ user: userId, items: [] });
  }
  // Prevent duplicates
  if (wishlist.items.some(item => item.cake.toString() === cakeId)) {
    throw new Error('Cake already in wishlist');
  }
  wishlist.items.push({ cake: cakeId });
  await wishlist.save();
  return wishlist;
};

exports.removeFromWishlist = async (userId, cakeId) => {
  const wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) throw new Error('Wishlist not found');
  const before = wishlist.items.length;
  wishlist.items = wishlist.items.filter(item => item.cake.toString() !== cakeId);
  if (wishlist.items.length === before) throw new Error('Cake not found in wishlist');
  await wishlist.save();
  return wishlist;
};