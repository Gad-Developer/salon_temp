const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true },
  memberType: { type: String, enum: ['Customer', 'VIP Member'], default: 'Customer' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);