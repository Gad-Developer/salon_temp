const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  nameEn: { type: String, required: true },
  nameAr: { type: String, required: true },
  description: { type: String },
  image: { type: String }, // <-- ADDED THIS LINE
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