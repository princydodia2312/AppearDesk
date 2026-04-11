const Payment = require('../models/payment.model');
const Invoice = require('../models/invoice.model');
const Order = require('../models/order.model');

const getPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.invoice) filter.invoice = req.query.invoice;
    if (req.query.customer) filter.customer = req.query.customer;
    if (req.query.status) filter.status = req.query.status;

    const total = await Payment.countDocuments(filter);
    const data = await Payment.find(filter)
      .populate('invoice', 'invoiceNumber total')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('invoice')
      .populate('customer');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPayment = async (req, res) => {
  try {
    const { invoice: invoiceId, customer, amount, method, transactionId, notes } = req.body;
    
    const invoiceRecord = await Invoice.findById(invoiceId);
    if (!invoiceRecord) return res.status(404).json({ message: 'Invoice not found' });
    
    if (amount <= 0) return res.status(400).json({ message: 'Amount must be greater than 0' });
    if (amount > invoiceRecord.balanceDue) return res.status(400).json({ message: 'Amount exceeds balance due' });

    const payment = await Payment.create({
      invoice: invoiceId,
      customer,
      amount,
      method,
      transactionId,
      notes,
      status: 'completed',
      paidAt: Date.now(),
      recordedBy: req.user._id
    });

    // Mark invoice as fully paid
    invoiceRecord.status = 'paid';
    invoiceRecord.paidAt = Date.now();
    await invoiceRecord.save();

    // Mark associated order as fully paid
    const order = await Order.findOne({ invoice: invoiceRecord._id });
    if (order) {
      order.paymentStatus = 'paid';
      await order.save();
    }

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPayments, getPayment, createPayment };
