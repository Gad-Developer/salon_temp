const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  nameEn: { type: String, required: true },
  nameAr: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  durationMinutes: { type: Number, required: true },
  itemsEn: [{ type: String }],
  itemsAr: [{ type: String }],
  images: [[{ type: String }]], // <-- MODIFIED: Array of arrays for srcset URLs
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);