const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getVendors, getVendor, createVendor, updateVendor, deleteVendor,
} = require('../controllers/vendor.controller');

router.get('/', protect, getVendors);
router.get('/:id', protect, getVendor);
router.post('/', protect, authorize('admin', 'manager'), createVendor);
router.put('/:id', protect, authorize('admin', 'manager'), updateVendor);
router.delete('/:id', protect, authorize('admin'), deleteVendor);

module.exports = router;