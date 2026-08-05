const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');

router.get('/', protect, getNotifications);

// Route ordering: /read-all MUST come before /:id/read to prevent route ambiguity
router.patch('/read-all', protect, markAllAsRead);
router.put('/read-all', protect, markAllAsRead);

router.patch('/:id/read', protect, markAsRead);
router.put('/:id/read', protect, markAsRead);

router.delete('/:id', protect, deleteNotification);

module.exports = router;