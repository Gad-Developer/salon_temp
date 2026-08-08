const mongoose = require('mongoose');

const reviewCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  isUsed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto-deletes after 24 hours (86400 seconds)
});

module.exports = mongoose.model('ReviewCode', reviewCodeSchema);