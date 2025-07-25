const addressService = require('../services/addressService');

exports.addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const address = await addressService.addAddress(userId, req.body);
    res.status(201).json(address);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await addressService.getAddresses(userId);
    res.status(200).json(addresses);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const address = await addressService.updateAddress(userId, addressId, req.body);
    res.status(200).json(address);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    await addressService.deleteAddress(userId, addressId);
    res.status(200).json({ message: 'Address deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};