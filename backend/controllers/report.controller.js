const Order = require('../models/order.model');
const Customer = require('../models/customer.model');
const Invoice = require('../models/invoice.model');
const Vendor = require('../models/vendor.model');
const Product = require('../models/product.model');

const getSummary = async (req, res) => {
  try {
    const [
      totalOrders,
      totalRevenueResult,
      totalCustomers,
      pendingInvoices,
      totalVendors,
      pendingOrders,
      lowStockProducts
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Customer.countDocuments({ isActive: true }),
      Invoice.countDocuments({ status: { $in: ['draft', 'sent', 'partial', 'overdue'] } }),
      Vendor.countDocuments({ isActive: true }),
      Order.countDocuments({ status: 'pending' }),
      Product.countDocuments({ stock: { $lte: 5 }, isActive: true })
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0,
      totalCustomers,
      pendingInvoices,
      totalVendors,
      pendingOrders,
      lowStockProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMonthlyRevenue = async (req, res) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const data = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedData = [];
    
    let currentDate = new Date(twelveMonthsAgo);
    const now = new Date();
    
    while (currentDate <= now) {
      const year = currentDate.getFullYear();
      const monthIndex = currentDate.getMonth();
      const monthStr = `${monthNames[monthIndex]} ${year}`;
      
      const found = data.find(d => d._id.year === year && d._id.month === (monthIndex + 1));
      
      formattedData.push({
        month: monthStr,
        revenue: found ? found.revenue : 0,
        orders: found ? found.orders : 0
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTopProducts = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          revenue: { $sum: '$items.total' },
          qty: { $sum: '$items.qty' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          _id: 1,
          revenue: 1,
          qty: 1,
          name: '$productDetails.name'
        }
      }
    ]);
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSummary, getMonthlyRevenue, getTopProducts };
