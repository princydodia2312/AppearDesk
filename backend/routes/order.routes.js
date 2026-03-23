const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');

// TODO (P2): implement order routes
router.get('/', protect, (req, res) => {
  res.json({ message: 'order route — coming soon' });
});

module.exports = router;
