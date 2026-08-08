const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus, updateOrderDetails, deleteOrder } = require('../controllers/orderController');

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/:id/status')
  .patch(updateOrderStatus);

// UPDATED: Added updateOrderDetails to the /:id patch route
router.route('/:id')
  .patch(updateOrderDetails)
  .delete(deleteOrder);

module.exports = router;