const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');

// TODO (P2): implement vendor routes
router.get('/', protect, (req, res) => {
  res.json({ message: 'vendor route — coming soon' });
});

module.exports = router;
