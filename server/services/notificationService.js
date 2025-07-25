const Notification = require('../models/Notification');

exports.createNotification = async ({ user, type, message, data }) => {
  return await Notification.create({ user, type, message, data });
};

exports.getUserNotifications = async (userId) => {
  return await Notification.find({ user: userId }).sort({ createdAt: -1 });
};

exports.markAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
};