const mongoose = require('mongoose');
const APPROVED_COLLEGES = require('../constants/colleges');

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
    required: true,
    enum: APPROVED_COLLEGES
  },
  department: {
    type: String,
    required: true
  },
  year: {
    type: String,
    enum: ['1st', '2nd', '3rd', '4th', '5th', 'Graduated', '1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'First Year', 'Second Year', 'Third Year', 'Final Year'],
    default: 'First Year'
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
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

  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  location: {
    type: String,
    default: ''
  },
  settings: {
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public'
      },
      showEmail: {
        type: Boolean,
        default: true
      }
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      likes: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      friendRequests: { type: Boolean, default: true },
      communityUpdates: { type: Boolean, default: true },
      eventNotifications: { type: Boolean, default: true }
    },
    appearance: {
      theme: {
        type: String,
        enum: ['dark', 'light', 'system'],
        default: 'dark'
      }
    }
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isVerified: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['Active', 'Suspended'],
    default: 'Active'
  },
  phone: {
    type: String,
    default: ''
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