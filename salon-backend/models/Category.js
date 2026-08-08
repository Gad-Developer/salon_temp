const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  nameEn: { type: String, required: true },
  nameAr: { type: String, required: true },
  descriptionEn: { type: String }, // <-- UPDATED FOR ENGLISH
  descriptionAr: { type: String }, // <-- UPDATED FOR ARABIC
  image: { type: String }, 
  price: { type: Number, required: true },
  originalPrice: { type: Number }, 
  durationMinutes: { type: Number, required: true }
});

const categorySchema = new mongoose.Schema({
  titleEn: { type: String, required: true },
  titleAr: { type: String, required: true },
  services: [serviceSchema]
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);