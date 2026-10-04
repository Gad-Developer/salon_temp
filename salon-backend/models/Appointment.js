const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  services: [
    {
      serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      nameEn: { type: String, required: true },
      nameAr: { type: String, required: true },
      categoryTitleEn: { type: String, required: true }
    }
  ],
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    default: null
  },
  isPackage: { 
    type: Boolean, 
    default: false 
  },
  // CHANGED: From String to ObjectId to properly reference the Professional Model
  professionalId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Professional',
    default: null
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  date: { type: String, required: true },
  time: { type: String, required: true },
  clientName: { type: String, required: true },
  clientPhone: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending' 
  },
  // NEW: Audit log for status changes and reassignments
  auditLog: [{
    action: { type: String, required: true }, // e.g., "Status Changed to Completed", "Professional Reassigned"
    note: { type: String, required: true },   // The mandatory justification
    timestamp: { type: Date, default: Date.now },
    adminName: { type: String, default: 'Admin' } // Hardcoded for now until Auth is built
  }]
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);