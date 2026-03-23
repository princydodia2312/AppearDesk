const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    code:        { type: String, unique: true, uppercase: true },
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'free_shipping'],
      default: 'percentage',
    },
    value:       { type: Number, required: true },
    minOrderAmt: { type: Number, default: 0 },
    maxUses:     { type: Number },
    usedCount:   { type: Number, default: 0 },
    startDate:   { type: Date },
    endDate:     { type: Date },
    isActive:    { type: Boolean, default: true },
    appliesTo: {
      type: String,
      enum: ['all', 'products', 'customers'],
      default: 'all',
    },
    products:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    customers:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }],
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer', offerSchema);
