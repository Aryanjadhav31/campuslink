const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  sendMessage,
  getMessages,
  getChatUsers,
  markAsRead,
  deleteMessage
} = require('../controllers/chatController');

router.post('/send', protect, sendMessage);
router.get('/messages/:userId', protect, getMessages);
router.get('/users', protect, getChatUsers);
router.put('/read/:userId', protect, markAsRead);
router.delete('/messages/:messageId', protect, deleteMessage);

module.exports = router;