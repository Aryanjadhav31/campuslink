const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  upload,
  uploadImage,
  uploadMultipleImages,
  uploadProfileImage
} = require('../controllers/uploadController');

// ✅ Single image upload
router.post('/image', protect, upload.single('image'), uploadImage);

// ✅ Multiple images upload
router.post('/images', protect, upload.array('images', 5), uploadMultipleImages);

// ✅ Profile image upload
router.post('/profile', protect, upload.single('image'), uploadProfileImage);

module.exports = router;