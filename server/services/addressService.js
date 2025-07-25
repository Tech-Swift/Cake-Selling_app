const Address = require('../models/Address');

exports.addAddress = async (userId, data) => {
  if (data.isDefault) {
    // Unset previous default
    await Address.updateMany({ user: userId }, { isDefault: false });
  }
  return await Address.create({ ...data, user: userId });
};

exports.getAddresses = async (userId) => {
  return await Address.find({ user: userId });
};

exports.updateAddress = async (userId, addressId, data) => {
  if (data.isDefault) {
    await Address.updateMany({ user: userId }, { isDefault: false });
  }
  return await Address.findOneAndUpdate(
    { _id: addressId, user: userId },
    data,
    { new: true }
  );
};

exports.deleteAddress = async (userId, addressId) => {
  return await Address.findOneAndDelete({ _id: addressId, user: userId });
};