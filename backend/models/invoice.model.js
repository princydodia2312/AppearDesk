const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, unique: true },
    order:         { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    customer:      { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    items:         [
      {
        description: { type: String },
        qty:         { type: Number },
        unitPrice:   { type: Number },
        total:       { type: Number },
      },
    ],
    subtotal:      { type: Number, default: 0 },
    tax:           { type: Number, default: 0 },
    discount:      { type: Number, default: 0 },
    total:         { type: Number, default: 0 },
    amountPaid:    { type: Number, default: 0 },
    balanceDue:    { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'],
      default: 'draft',
    },
    dueDate:       { type: Date },
    paidAt:        { type: Date },
    notes:         { type: String },
    createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

invoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`;
  }
  this.balanceDue = this.total - this.amountPaid;
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
