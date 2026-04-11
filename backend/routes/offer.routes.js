const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getOffers, getOffer, applyOffer, createOffer, updateOffer, deleteOffer } = require('../controllers/offer.controller');

router.get('/', protect, getOffers);
router.post('/apply', protect, applyOffer);
router.get('/:id', protect, getOffer);
router.post('/', protect, authorize('admin', 'manager'), createOffer);
router.put('/:id', protect, authorize('admin', 'manager'), updateOffer);
router.delete('/:id', protect, authorize('admin'), deleteOffer);

module.exports = router;
