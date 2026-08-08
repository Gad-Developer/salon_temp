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
      quantity: { type: Number, required: true, min: 1 }
    }
  ],
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);