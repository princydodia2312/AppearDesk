const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, lowercase: true },
    phone:   { type: String },
    company: { type: String },
    address: {
      street:  String,
      city:    String,
      state:   String,
      zip:     String,
      country: { type: String, default: 'India' },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vendor', vendorSchema);
