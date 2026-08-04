const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getFilterOptions,
  getUsers,
  getUserById,
  updateProfile,
  updatePassword,
  updatePrivacy,
  updateNotifications,
  updateAppearance,
  getSuggestions
} = require('../controllers/userController');

router.get('/', protect, getUsers);
router.get('/filter-options', protect, getFilterOptions);
router.get('/suggestions', protect, getSuggestions);
router.get('/:id', protect, getUserById);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.put('/settings/privacy', protect, updatePrivacy);
router.put('/settings/notifications', protect, updateNotifications);
router.put('/settings/appearance', protect, updateAppearance);

module.exports = router;