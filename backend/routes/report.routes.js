const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getSummary, getMonthlyRevenue, getTopProducts } = require('../controllers/report.controller');

router.get('/summary', protect, authorize('admin', 'manager'), getSummary);
router.get('/monthly', protect, authorize('admin', 'manager'), getMonthlyRevenue);
router.get('/top-products', protect, authorize('admin', 'manager'), getTopProducts);

module.exports = router;
