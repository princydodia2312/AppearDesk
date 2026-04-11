const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getUsers, getUser, updateUser, deactivateUser } = require('../controllers/user.controller');

router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, getUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, authorize('admin'), deactivateUser);

module.exports = router;
