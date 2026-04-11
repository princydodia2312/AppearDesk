const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  placedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String },
    sku: { type: String },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number }
  }],
  status: { type: String, enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  subtotal: { type: Number, default: 0 },
  taxRate: { type: Number, default: 5 },
  taxAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  shippingCharge: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
  offerCode: { type: String },
  shippingAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String }
  },
  notes: { type: String },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
