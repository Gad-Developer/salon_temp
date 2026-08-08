const Order = require('../models/Order');

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { clientName, clientPhone, branchId, date, time, items, totalPrice } = req.body;
    
    const newOrder = new Order({
      clientName,
      clientPhone,
      branchId,
      date, // NEW
      time, // NEW
      items,
      totalPrice
    });

    await newOrder.save();
    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
    res.status(400).json({ message: 'Error creating order', error: error.message });
  }
};

// GET /api/orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('branchId', 'nameEn nameAr')
      .populate('items.productId', 'nameEn nameAr brand price')
      .sort({ createdAt: -1 });
      
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching orders', error: error.message });
  }
};

// PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    ).populate('branchId', 'nameEn nameAr')
     .populate('items.productId', 'nameEn nameAr brand price');

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Status updated', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

// NEW: PATCH /api/orders/:id (For updating date/time)
exports.updateOrderDetails = async (req, res) => {
  try {
    const { date, time } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id, 
      { date, time }, 
      { new: true }
    );
    if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

// DELETE /api/orders/:id
exports.deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
};