const Invoice = require('../models/invoice.model');

const getInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.customer) filter.customer = req.query.customer;

    const total = await Invoice.countDocuments(filter);
    const data = await Invoice.find(filter)
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('order', 'orderNumber');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createInvoice = async (req, res) => {
  try {
    const invoiceData = {
      ...req.body,
      createdBy: req.user._id
    };
    const invoice = await Invoice.create(invoiceData);
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const oldInvoice = await Invoice.findById(req.params.id);
    if (!oldInvoice) return res.status(404).json({ message: 'Invoice not found' });
    
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getInvoices, getInvoice, createInvoice, updateInvoice, updateInvoiceStatus, deleteInvoice };
