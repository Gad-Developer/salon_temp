const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Changed from a single serviceId to an array of objects to support multiple selections
  services: [
    {
      serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      nameEn: { type: String, required: true },
      nameAr: { type: String, required: true },
      categoryTitleEn: { type: String, required: true } // Preserves grouping context (e.g., "Kids", "Hair & Beard")
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
  professionalId: { 
    type: String, 
    ref: 'Professional',
    required: false 
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
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);