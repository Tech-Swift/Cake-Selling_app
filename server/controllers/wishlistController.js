const wishlistService = require('../services/wishlistService');

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await wishlistService.getWishlist(userId);
    res.status(200).json(wishlist);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cakeId } = req.body;
    const wishlist = await wishlistService.addToWishlist(userId, cakeId);
    res.status(200).json(wishlist);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cakeId } = req.params;
    const wishlist = await wishlistService.removeFromWishlist(userId, cakeId);
    res.status(200).json(wishlist);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};