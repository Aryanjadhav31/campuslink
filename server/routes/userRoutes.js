const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUsers,
  getUserById,
  updateProfile,
  getSuggestions
} = require('../controllers/userController');

router.get('/', protect, getUsers);
router.get('/suggestions', protect, getSuggestions);
router.get('/:id', protect, getUserById);
router.put('/profile', protect, updateProfile);

module.exports = router;