const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Google Login
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name, profileImage } = req.body;

    // Check allowed domains
    const domain = email.split('@')[1];
    const allowedDomains = [
      'ritindia.edu',
      'walchandsangli.ac.in',
      'gcekarad.ac.in',
      'kitcoek.ac.in',
      'dkte.ac.in',
      'adcet.ac.in',
      'pvpit.ac.in',
      'amgoi.ac.in',
      'sanjayghodawatuniversity.ac.in'
    ];

    if (!allowedDomains.includes(domain)) {
      return res.status(400).json({ 
        message: 'Please use your college email address' 
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Update user if needed
      user.isVerified = true;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name: name,
        email: email,
        password: Math.random().toString(36).slice(-8),
        profileImage: profileImage || '',
        isVerified: true
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      token: token
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;