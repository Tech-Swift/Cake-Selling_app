const cartService = require('../services/cartService');

exports.addToCart = async (req, res) => {
  try {
    const { cakeId } = req.body;
    const userId = req.user.id;

    const cart = await cartService.addToCart(userId, cakeId);
    res.status(200).json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Rename this function to match your route handler
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartService.getUserCart(userId);
    res.status(200).json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

 exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const cart = await cartService.removeFromCart(userId, itemId); 
    res.status(200).json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.checkoutCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await cartService.checkoutCart(userId);
    res.status(200).json({ message: 'Checkout successful', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};