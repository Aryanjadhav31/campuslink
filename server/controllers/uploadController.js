const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ✅ Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // Max 5 files
  },
  fileFilter: fileFilter
});

// ✅ Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'campuslink',
        ...options
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const readable = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      }
    });

    readable.pipe(stream);
  });
};

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
const uploadImage = async (req, res) => {
  try {
    console.log('📤 Uploading image...');
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ message: 'No image uploaded' });
    }

    console.log('📄 File:', req.file.originalname, req.file.size, 'bytes');

    const result = await uploadToCloudinary(req.file.buffer, {
      transformation: [
        { width: 1200, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    console.log('✅ Image uploaded:', result.secure_url);

    res.json({
      url: result.secure_url,
      publicId: result.public_id
    });
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload image',
      error: error.message 
    });
  }
};

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
const uploadMultipleImages = async (req, res) => {
  try {
    console.log('📤 Uploading multiple images...');
    
    if (!req.files || req.files.length === 0) {
      console.log('❌ No files uploaded');
      return res.status(400).json({ message: 'No images uploaded' });
    }

    console.log(`📄 Uploading ${req.files.length} images`);

    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, {
        transformation: [
          { width: 1200, crop: 'limit' },
          { quality: 'auto' }
        ]
      })
    );

    const results = await Promise.all(uploadPromises);
    
    const imageUrls = results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id
    }));

    console.log(`✅ ${imageUrls.length} images uploaded`);

    res.json(imageUrls);
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload images',
      error: error.message 
    });
  }
};

// @desc    Upload profile image
// @route   POST /api/upload/profile
// @access  Private
const uploadProfileImage = async (req, res) => {
  try {
    console.log('📤 Uploading profile image...');
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ message: 'No image uploaded' });
    }

    console.log('📄 File:', req.file.originalname, req.file.size, 'bytes');

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'campuslink/profiles',
      transformation: [
        { width: 400, height: 400, crop: 'fill' },
        { quality: 'auto' }
      ]
    });

    // ✅ Update user's profile image
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      profileImage: result.secure_url
    });

    console.log('✅ Profile image uploaded:', result.secure_url);

    res.json({
      url: result.secure_url,
      publicId: result.public_id
    });
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload profile image',
      error: error.message 
    });
  }
};

module.exports = {
  upload,
  uploadImage,
  uploadMultipleImages,
  uploadProfileImage
};