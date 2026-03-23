const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    sku:         { type: String, unique: true, trim: true },
    description: { type: String },
    category:    { type: String },
    price:       { type: Number, required: true, default: 0 },
    stock:       { type: Number, default: 0 },
    images:      [{ type: String }],
    isActive:    { type: Boolean, default: true },
    vendor:      { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    // TODO (P2): add more fields as needed
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
