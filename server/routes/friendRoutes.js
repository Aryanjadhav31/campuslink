const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getFriends,
  removeFriend
} = require('../controllers/friendController');

router.post('/request', protect, sendFriendRequest);
router.post('/accept', protect, acceptFriendRequest);
router.post('/reject', protect, rejectFriendRequest);
router.get('/requests', protect, getFriendRequests);
router.get('/', protect, getFriends);
router.delete('/:friendId', protect, removeFriend);

module.exports = router;