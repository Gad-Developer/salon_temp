const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus, updateOrderDetails, updateOrderItems, deleteOrder } = require('../controllers/orderController');

const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/:id/status')
  .patch(protect, updateOrderStatus);

// UPDATED: Added updateOrderDetails and updateOrderItems to the /:id patch routes
router.route('/:id/items')
  .patch(protect, updateOrderItems);

router.route('/:id')
  .patch(protect, updateOrderDetails)
  .delete(protect, deleteOrder);

module.exports = router;