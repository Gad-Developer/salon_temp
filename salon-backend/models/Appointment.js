const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  serviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category.services',
    required: true 
  },
  professionalId: { 
    type: String, 
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