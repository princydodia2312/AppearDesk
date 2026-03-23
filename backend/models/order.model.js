const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String },
  qty:         { type: Number, required: true, min: 1 },
  unitPrice:   { type: Number, required: true },
  discount:    { type: Number, default: 0 },
  total:       { type: Number },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    customer:    { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    items:       [lineItemSchema],
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    subtotal:    { type: Number, default: 0 },
    tax:         { type: Number, default: 0 },
    discount:    { type: Number, default: 0 },
    total:       { type: Number, default: 0 },
    shippingAddress: {
      street:  { type: String },
      city:    { type: String },
      state:   { type: String },
      zip:     { type: String },
      country: { type: String },
    },
    notes:       { type: String },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // TODO (P2): link to invoice once generated
  },
  { timestamps: true }
);

// Auto-generate order number before saving
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
