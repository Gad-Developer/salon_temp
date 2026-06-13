const express = require('express');
const router = express.Router();
// Import the new updateOrderStatus function
const { createOrder, getOrders, updateOrderStatus, deleteOrder } = require('../controllers/orderController');

router.route('/')
  .get(getOrders)
  .post(createOrder);

// NEW: Route to update specific order status
router.route('/:id/status')
  .patch(updateOrderStatus);

// NEW: Route to delete a specific order
router.route('/:id')
  .delete(deleteOrder);

module.exports = router;