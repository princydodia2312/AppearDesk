const Order = require('../models/order.model');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const Offer = require('../models/offer.model');

const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.customer) filter.customer = req.query.customer;

    const total = await Order.countDocuments(filter);
    const data = await Order.find(filter)
      .populate('customer', 'name email')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('items.product', 'name sku images');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { customer, items, shippingAddress, notes, offerCode } = req.body;

    let customerRecord;
    let resolvedCustomerId = customer;

    if (customer) {
      customerRecord = await Customer.findById(customer);
    } else {
      customerRecord = await Customer.findOne({ user: req.user._id });
      if (!customerRecord) {
        customerRecord = await Customer.create({
          user: req.user._id,
          name: shippingAddress?.fullName || 'Portal User',
          email: req.user.email || 'user@example.com',
          phone: shippingAddress?.phone || '',
          address: shippingAddress,
          billingAddress: shippingAddress
        });
      }
      resolvedCustomerId = customerRecord._id;
    }
    
    if (!customerRecord) return res.status(400).json({ message: 'Customer not found' });

    let subtotal = 0;
    const processedItems = [];
    const productsToUpdate = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(400).json({ message: `Product ${item.product} not found` });

      if (product.stock < item.qty) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const processedItem = {
        product: product._id,
        productName: product.name,
        sku: product.sku,
        qty: item.qty,
        unitPrice: product.price,
        total: item.qty * product.price,
        discount: 0
      };

      processedItems.push(processedItem);
      subtotal += processedItem.total;
      
      productsToUpdate.push({ product, qty: item.qty });
    }

    let discountAmount = 0;
    let shippingCharge = 0;
    let offerId = null;
    let appliedOfferCode = null;
    let offerToSave = null;

    if (offerCode) {
      const offer = await Offer.findOne({ code: { $regex: new RegExp(`^${offerCode}$`, 'i') }, isActive: true });
      
      if (!offer) {
        return res.status(400).json({ message: 'Invalid offer code' });
      }

      const now = new Date();
      if (offer.startDate && new Date(offer.startDate) > now) {
        return res.status(400).json({ message: 'Offer not yet active' });
      }
      if (offer.endDate && new Date(offer.endDate) < now) {
        return res.status(400).json({ message: 'Offer has expired' });
      }
      
      if (offer.maxUses && offer.usedCount >= offer.maxUses) {
        return res.status(400).json({ message: 'Offer usage limit reached' });
      }
      
      if (offer.minOrderAmt && subtotal < offer.minOrderAmt) {
        return res.status(400).json({ message: `Minimum order amount is ₹${offer.minOrderAmt}` });
      }

      if (offer.type === 'percentage') {
        discountAmount = subtotal * (offer.value / 100);
      } else if (offer.type === 'fixed') {
        discountAmount = offer.value;
      } else if (offer.type === 'free_shipping') {
        shippingCharge = 0;
      }

      offer.usedCount = (offer.usedCount || 0) + 1;
      offerId = offer._id;
      appliedOfferCode = offerCode;
      offerToSave = offer;
    }

    const taxRate = 5;
    const taxAmount = (subtotal - discountAmount) * (taxRate / 100);

    const total = subtotal - discountAmount + taxAmount + shippingCharge;

    const orderData = {
      customer: resolvedCustomerId,
      placedBy: req.user._id,
      items: processedItems,
      subtotal,
      taxRate,
      taxAmount,
      discountAmount,
      shippingCharge,
      total,
      shippingAddress,
      notes,
      createdBy: req.user._id
    };

    if (offerId) {
      orderData.offer = offerId;
      orderData.offerCode = appliedOfferCode;
    }

    const order = await Order.create(orderData);

    if (offerToSave) {
      await offerToSave.save();
    }

    for (const pToUpdate of productsToUpdate) {
      pToUpdate.product.stock -= pToUpdate.qty;
      await pToUpdate.product.save();
    }

    customerRecord.totalOrders = (customerRecord.totalOrders || 0) + 1;
    customerRecord.totalSpent = (customerRecord.totalSpent || 0) + total;
    await customerRecord.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (order.status === 'cancelled') {
        return res.status(400).json({ message: 'Order is already cancelled' });
    }

    order.status = 'cancelled';
    await order.save();

    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.qty;
        await product.save();
      }
    }

    res.json({ message: 'Order cancelled and stock restored' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getOrders, getOrder, createOrder, updateOrderStatus, cancelOrder };
