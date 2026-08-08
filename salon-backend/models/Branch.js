const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  nameEn: { type: String, required: true },
  nameAr: { type: String, required: true },
  addressEn: { type: String, required: true },
  addressAr: { type: String, required: true },
  phone: { type: String, required: true },
  workingHoursEn: { type: String, required: true },
  workingHoursAr: { type: String, required: true },
  mapUrl: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Branch', branchSchema);