const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  college: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  year: {
    type: String,
    enum: ['1st', '2nd', '3rd', '4th', '5th', 'Graduated'],
    default: '1st'
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  skills: [{
    type: String
  }],
  interests: [{
    type: String
  }],
  profileImage: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  lookingFor: {
    type: String,
    enum: ['Study Partner', 'Project Partner', 'Mentor', 'Friends', 'Networking'],
    default: 'Networking'
  },
  
  // ✅ NEW: Social Media Links
  socialLinks: {
    // Professional
    github: {
      type: String,
      default: ''
    },
    linkedin: {
      type: String,
      default: ''
    },
    portfolio: {
      type: String,
      default: ''
    },
    // ✅ New Social Media
    instagram: {
      type: String,
      default: ''
    },
    snapchat: {
      type: String,
      default: ''
    },
    twitter: {
      type: String,
      default: ''
    },
    youtube: {
      type: String,
      default: ''
    },
    facebook: {
      type: String,
      default: ''
    },
    discord: {
      type: String,
      default: ''
    },
    telegram: {
      type: String,
      default: ''
    },
    whatsapp: {
      type: String,
      default: ''
    }
  },
  
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);