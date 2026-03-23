const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    invoice:  { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    amount:   { type: Number, required: true },
    method: {
      type: String,
      enum: ['cash', 'bank_transfer', 'upi', 'card', 'cheque', 'other'],
      default: 'bank_transfer',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: { type: String },
    paidAt:        { type: Date },
    notes:         { type: String },
    recordedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
