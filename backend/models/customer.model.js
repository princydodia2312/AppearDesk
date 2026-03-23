const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name:      { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true },
    phone:     { type: String },
    company:   { type: String },
    address: {
      street:  { type: String },
      city:    { type: String },
      state:   { type: String },
      zip:     { type: String },
      country: { type: String, default: 'India' },
    },
    isActive:  { type: Boolean, default: true },
    // TODO (P2): add payment terms reference
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
