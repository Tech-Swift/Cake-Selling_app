const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Cake = require('../models/Cake');
const User = require('../models/User');
const ExcelJS = require('exceljs'); // For Excel export

// Helper: Parse date range from query
function getDateRange(query) {
  const from = query.from ? new Date(query.from) : new Date('2000-01-01');
  const to = query.to ? new Date(query.to) : new Date();
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

exports.getSalesStats = async (from, to) => {
  const payments = await Payment.aggregate([
    { $match: { status: 'paid', paidAt: { $gte: from, $lte: to } } },
    { $group: { _id: null, totalRevenue: { $sum: '$amount' }, totalOrders: { $sum: 1 } } }
  ]);
  return {
    totalRevenue: payments[0]?.totalRevenue || 0,
    totalOrders: payments[0]?.totalOrders || 0
  };
};

exports.getSalesChart = async (from, to) => {
  const sales = await Payment.aggregate([
    { $match: { status: 'paid', paidAt: { $gte: from, $lte: to } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
        total: { $sum: "$amount" }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  return sales;
};

exports.exportSales = async (from, to, format = 'excel') => {
  const orders = await Order.find({ createdAt: { $gte: from, $lte: to } })
    .populate('user', 'name email')
    .populate('items.cake', 'name price');
  if (format === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sales');
    sheet.columns = [
      { header: 'Order ID', key: 'id' },
      { header: 'User', key: 'user' },
      { header: 'Total', key: 'total' },
      { header: 'Status', key: 'status' },
      { header: 'Date', key: 'date' }
    ];
    orders.forEach(order => {
      sheet.addRow({
        id: order._id.toString(),
        user: order.user?.name || '',
        total: order.totalAmount,
        status: order.status,
        date: order.createdAt.toISOString().slice(0, 10)
      });
    });
    return await workbook.xlsx.writeBuffer();
  }
  // PDF export can be added similarly using a PDF library
  throw new Error('Only Excel export is implemented');
};

exports.getTopCakes = async () => {
  const cakes = await Order.aggregate([
    { $unwind: "$items" },
    { $group: { _id: "$items.cake", count: { $sum: "$items.quantity" } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "cakes",
        localField: "_id",
        foreignField: "_id",
        as: "cake"
      }
    },
    { $unwind: "$cake" },
    { $project: { _id: 0, cake: "$cake", count: 1 } }
  ]);
  return cakes;
};

exports.getTopSellers = async () => {
  const sellers = await Order.aggregate([
    { $unwind: "$items" },
    {
      $lookup: {
        from: "cakes",
        localField: "items.cake",
        foreignField: "_id",
        as: "cake"
      }
    },
    { $unwind: "$cake" },
    {
      $group: {
        _id: "$cake.createdBy",
        totalSold: { $sum: "$items.quantity" }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "seller"
      }
    },
    { $unwind: "$seller" },
    { $project: { _id: 0, seller: "$seller", totalSold: 1 } }
  ]);
  return sellers;
};

exports.getOrderStats = async () => {
  const stats = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  return stats;
};