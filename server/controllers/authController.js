const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// ✅ REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password, college, department, year } = req.body;

    console.log('📝 Registration attempt:', { name, email });

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      college,
      department,
      year,
      isVerified: true
    });

    console.log('✅ User created:', user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      college: user.college,
      department: user.department,
      year: user.year,
      role: user.role || 'student',
      profileImage: user.profileImage,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ LOGIN - THIS IS REQUIRED
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('📝 Login attempt:', { email });

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✅ Login successful:', user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      college: user.college,
      department: user.department,
      year: user.year,
      role: user.role || 'student',
      profileImage: user.profileImage,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET CURRENT USER
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('friends', 'name profileImage isOnline');
    res.json(user);
  } catch (error) {
    console.error('❌ Get me error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe
};