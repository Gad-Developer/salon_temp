const Order = require('../models/Order');
const Product = require('../models/Product');

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
      .populate('items.productId', 'nameEn nameAr brand price inventory')
      .sort({ createdAt: -1 });
      
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching orders', error: error.message });
  }
};

// PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const adminName = req.admin?.name || req.body.adminName || 'Admin';
    
    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const oldStatus = order.status;
    
    // Check stock if transitioning to Confirmed or Completed from a state where stock wasn't deducted
    if ((status === 'Confirmed' || status === 'Completed') && oldStatus !== 'Completed') {
      for (const item of order.items) {
        if (!item.isDeleted) {
          const product = await Product.findById(item.productId);
          if (product) {
            const branchInventory = product.inventory.find(inv => inv.branchId.toString() === order.branchId.toString());
            const stock = branchInventory ? branchInventory.stock : 0;
            if (stock < item.quantity) {
              return res.status(400).json({ message: `Insufficient stock for ${product.nameEn}. Available: ${stock}, Requested: ${item.quantity}` });
            }
          }
        }
      }
    }

    order.status = status;

    // Handle Inventory changes
    if (status === 'Completed' && oldStatus !== 'Completed') {
      // Deduct stock
      for (const item of order.items) {
        if (!item.isDeleted) {
          const product = await Product.findById(item.productId);
          if (product) {
            const branchInventory = product.inventory.find(inv => inv.branchId.toString() === order.branchId.toString());
            if (branchInventory) {
              branchInventory.stock -= item.quantity;
            } else {
              product.inventory.push({ branchId: order.branchId, stock: -item.quantity });
            }
            await product.save();
          }
        }
      }
    } else if (oldStatus === 'Completed' && status !== 'Completed') {
      // Restore stock
      for (const item of order.items) {
        if (!item.isDeleted) {
          const product = await Product.findById(item.productId);
          if (product) {
            const branchInventory = product.inventory.find(inv => inv.branchId.toString() === order.branchId.toString());
            if (branchInventory) {
              branchInventory.stock += item.quantity;
            } else {
              product.inventory.push({ branchId: order.branchId, stock: item.quantity });
            }
            await product.save();
          }
        }
      }
    }
    order.auditLog.push({
      action: `Status changed to ${status}`,
      note: note || 'No note provided',
      adminName
    });

    await order.save();

    const updatedOrder = await Order.findById(req.params.id)
      .populate('branchId', 'nameEn nameAr')
      .populate('items.productId', 'nameEn nameAr brand price inventory');

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

// NEW: PATCH /api/orders/:id/items (For adding/removing products)
exports.updateOrderItems = async (req, res) => {
  try {
    const { items, note } = req.body;
    const adminName = req.admin?.name || req.body.adminName || 'Admin';
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid items format' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Securely recalculate total price from DB and optionally check stock
    let newTotalPrice = 0;
    const itemsWithPrices = [];

    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }
      
      // If order is Confirmed, we should ensure the new quantity doesn't exceed stock
      if (order.status === 'Confirmed' && !item.isDeleted) {
        const branchInventory = product.inventory.find(inv => inv.branchId.toString() === order.branchId.toString());
        const stock = branchInventory ? branchInventory.stock : 0;
        if (stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product.nameEn}. Available: ${stock}, Requested: ${item.quantity}` });
        }
      }

      // Only add to total price if not deleted
      if (!item.isDeleted) {
        newTotalPrice += product.price * item.quantity;
      }
      
      itemsWithPrices.push({
        productId: product._id,
        quantity: item.quantity,
        isDeleted: item.isDeleted || false
      });
    }

    // Determine what changed for the audit log
    const oldItemCount = order.items.filter(i => !i.isDeleted).length;
    const newItemCount = itemsWithPrices.filter(i => !i.isDeleted).length;

    order.items = itemsWithPrices;
    order.totalPrice = newTotalPrice;
    
    order.auditLog.push({
      action: `Items Updated (${oldItemCount} -> ${newItemCount} items). New Total: ${newTotalPrice}`,
      note: note || 'Manually updated order items',
      adminName
    });

    await order.save();

    const updatedOrder = await Order.findById(req.params.id)
      .populate('branchId', 'nameEn nameAr')
      .populate('items.productId', 'nameEn nameAr brand price inventory');

    res.status(200).json({ message: 'Order items updated', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order items', error: error.message });
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