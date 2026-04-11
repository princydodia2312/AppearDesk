const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getPayments, getPayment, createPayment } = require('../controllers/payment.controller');

router.get('/', protect, getPayments);
router.get('/:id', protect, getPayment);
router.post('/', protect, authorize('admin', 'manager'), createPayment);

module.exports = router;
