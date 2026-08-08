const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nameAr: { type: String, required: true },
  nameEn: { type: String, required: true },
  brand: { type: String, required: true },
  taglineAr: { type: String },
  taglineEn: { type: String },
  price: { type: Number, required: true },
  image: { type: String, required: true }, // Cloudinary URL
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);