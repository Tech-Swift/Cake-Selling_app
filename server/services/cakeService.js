const Cake = require('../models/Cake');
const notificationService = require('../services/notificationService');
const User = require('../models/User');

// Create a new cake
exports.createCake = async (cakeData) => {
  const cake = await Cake.create(cakeData);

  // Notify the user who added the cake
  await notificationService.createNotification({
    user: cake.createdBy,
    type: 'cake',
    message: 'Your cake has been added successfully!',
    data: { cakeId: cake._id }
  });

  // Notify all admins
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await notificationService.createNotification({
      user: admin._id,
      type: 'cake',
      message: `A new cake has been added by user ${cake.createdBy}`,
      data: { cakeId: cake._id }
    });
  }

  return cake;
};

// Get all cakes (optionally filter by category)
exports.getAllCakes = async (filter = {}) => {
  return await Cake.find(filter).populate('createdBy', 'name email');
};

// Get single cake by ID
exports.getCakeById = async (cakeId) => {
  return await Cake.findById(cakeId).populate('createdBy', 'name email');
};

exports.getCakesByUser = async (userId) => {
  return await Cake.find({ createdBy: userId }).populate('createdBy', 'name email');
};
// Update a cake
exports.updateCake = async (cakeId, data, userId) => {
  const cake = await Cake.findOne({ _id: cakeId, createdBy: userId });
  if (!cake) return null;
  Object.assign(cake, data);
  return await cake.save();
};

// Delete a cake
exports.deleteCake = async (cakeId, userId) => {
  const cake = await Cake.findOne({ _id: cakeId, createdBy: userId });
  if (!cake) return null;
  return await cake.deleteOne();
};

exports.getFeaturedCakes = async () => {
  return await Cake.find({ featured: true }).populate('createdBy', 'name email');
};

