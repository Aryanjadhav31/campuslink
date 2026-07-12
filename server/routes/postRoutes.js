const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createPost,
  getPosts,
  likePost,
  commentOnPost,
  deletePost
} = require('../controllers/postController');

router.post('/', protect, createPost);
router.get('/', protect, getPosts);
router.post('/:postId/like', protect, likePost);
router.post('/:postId/comment', protect, commentOnPost);
router.delete('/:postId', protect, deletePost);

module.exports = router;