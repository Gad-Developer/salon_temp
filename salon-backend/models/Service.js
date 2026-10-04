const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  },
  nameEn: { type: String, required: true },
  nameAr: { type: String, required: true },
  descriptionEn: { type: String }, 
  descriptionAr: { type: String }, 
  images: [{ type: String }], 
  price: { type: Number, required: true },
  originalPrice: { type: Number }, 
  durationMinutes: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);