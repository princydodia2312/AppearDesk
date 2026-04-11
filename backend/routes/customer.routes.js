const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customer.controller');

router.get('/', protect, getCustomers);
router.get('/:id', protect, getCustomer);
router.post('/', protect, authorize('admin', 'manager'), createCustomer);
router.put('/:id', protect, authorize('admin', 'manager'), updateCustomer);
router.delete('/:id', protect, authorize('admin'), deleteCustomer);

module.exports = router;
