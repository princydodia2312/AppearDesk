const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, unique: true, trim: true },
  description: { type: String },
  category: { type: String },
  tags: [{ type: String }],
  price: { type: Number, required: true, default: 0 },
  compareAtPrice: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  images: [{ type: String }],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

productSchema.pre('save', function(next) {
  if (!this.sku) {
    this.sku = 'PRD-' + Math.floor(100000 + Math.random() * 900000);
  }
  next();
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
