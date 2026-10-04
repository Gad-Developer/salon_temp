const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nameAr: { type: String, required: true },
  nameEn: { type: String, required: true },
  brand: { type: String, required: true },
  taglineAr: { type: String },
  taglineEn: { type: String },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  // NEW: Multi-branch inventory tracking
  inventory: [{
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    stock: { type: Number, default: 0 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);