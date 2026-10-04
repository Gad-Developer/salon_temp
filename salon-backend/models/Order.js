const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  clientPhone: { type: String, required: true },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  date: { type: String, required: true }, // NEW: Added Date
  time: { type: String, required: true }, // NEW: Added Time
  items: [
    {
      productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
      },
      quantity: { type: Number, required: true, min: 0 },
      isDeleted: { type: Boolean, default: false }
    }
  ],
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  auditLog: [{
    action: { type: String, required: true },
    note: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    adminName: { type: String, default: 'Admin' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);