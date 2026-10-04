const mongoose = require('mongoose');

const professionalSchema = new mongoose.Schema({
  nameEn: { type: String, required: true },
  nameAr: { type: String, required: true },
  roleEn: { type: String, required: true },
  roleAr: { type: String, required: true },
  avatar: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  // NEW: Link professionals to specific physical locations
  assignedBranches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }]
}, { timestamps: true });

module.exports = mongoose.model('Professional', professionalSchema);