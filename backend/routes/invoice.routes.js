const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getInvoices, getInvoice, createInvoice, updateInvoice, updateInvoiceStatus, deleteInvoice,
} = require('../controllers/invoice.controller');

router.get('/', protect, getInvoices);
router.get('/:id', protect, getInvoice);
router.post('/', protect, createInvoice);
router.put('/:id', protect, updateInvoice);
router.put('/:id/status', protect, authorize('admin', 'manager'), updateInvoiceStatus);
router.delete('/:id', protect, authorize('admin'), deleteInvoice);

module.exports = router;