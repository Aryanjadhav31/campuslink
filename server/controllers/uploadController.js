const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ✅ Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
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

// ✅ Save file locally as fallback
const saveFileLocally = async (fileBuffer, originalName) => {
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const ext = path.extname(originalName) || '.jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
  const filePath = path.join(uploadsDir, fileName);

  await fs.promises.writeFile(filePath, fileBuffer);
  return `http://localhost:${process.env.PORT || 5000}/uploads/${fileName}`;
};

// ✅ Helper function to upload to Cloudinary with Local Fallback
const processImageUpload = async (file, options = {}) => {
  const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

  if (isCloudinaryConfigured) {
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'campuslink',
            transformation: [
              { width: 1200, crop: 'limit' },
              { quality: 'auto' }
            ],
            ...options
          },
          (error, res) => {
            if (error) reject(error);
            else resolve(res);
          }
        );

        const readable = new Readable({
          read() {
            this.push(file.buffer);
            this.push(null);
          }
        });

        readable.pipe(stream);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (cloudinaryError) {
      console.warn('⚠️ Cloudinary upload failed, falling back to local storage:', cloudinaryError.message);
    }
  }

  // Fallback to local storage
  const localUrl = await saveFileLocally(file.buffer, file.originalname);
  return {
    url: localUrl,
    publicId: null
  };
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

    const result = await processImageUpload(req.file);

    console.log('✅ Image processed successfully:', result.url);

    res.json({
      url: result.url,
      publicId: result.publicId
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

    console.log(`📄 Processing ${req.files.length} images`);

    const uploadPromises = req.files.map(file => processImageUpload(file));
    const results = await Promise.all(uploadPromises);

    console.log(`✅ ${results.length} images processed`);

    res.json(results);
    
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

    const result = await processImageUpload(req.file, { folder: 'campuslink/profiles' });

    // Update user profile image
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      profileImage: result.url
    });

    console.log('✅ Profile image updated:', result.url);

    res.json({
      url: result.url,
      publicId: result.publicId
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