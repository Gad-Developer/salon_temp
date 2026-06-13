const mongoose = require('mongoose');

const professionalSchema = new mongoose.Schema({
  nameEn: { type: String, required: true },
  nameAr: { type: String, required: true },
  roleEn: { type: String, required: true },
  roleAr: { type: String, required: true },
  avatar: { type: String, default: "" }, // Can hold a URL or path to an image later
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Professional', professionalSchema);