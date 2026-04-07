const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getOrders, getOrder, createOrder, updateOrderStatus, cancelOrder,
} = require('../controllers/order.controller');

router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.post('/', protect, createOrder);
router.put('/:id/status', protect, authorize('admin', 'manager'), updateOrderStatus);
router.delete('/:id', protect, authorize('admin'), cancelOrder);

module.exports = router;