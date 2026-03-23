const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');

// TODO (P2): implement customer routes
router.get('/', protect, (req, res) => {
  res.json({ message: 'customer route — coming soon' });
});

module.exports = router;
