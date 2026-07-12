const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createCommunity,
  getCommunities,
  getCommunityById,
  joinCommunity,
  leaveCommunity
} = require('../controllers/communityController');

router.post('/', protect, createCommunity);
router.get('/', protect, getCommunities);
router.get('/:id', protect, getCommunityById);
router.post('/:id/join', protect, joinCommunity);
router.post('/:id/leave', protect, leaveCommunity);

module.exports = router;