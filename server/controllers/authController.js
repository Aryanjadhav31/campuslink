const User = require('../models/User');
const APPROVED_COLLEGES = require('../constants/colleges');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id, role = 'student') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// ✅ REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password, college, department, year } = req.body;

    console.log('📝 Registration attempt:', { name, email });

    if (!college || !APPROVED_COLLEGES.includes(college)) {
      return res.status(400).json({ message: 'Selected college is invalid. Please select an approved engineering college.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const adminEmail = (process.env.ADMIN_EMAIL || 'aryanjyoti.31@gmail.com').toLowerCase();
    const isSuperAdmin = email?.toLowerCase() === adminEmail;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      college,
      department,
      year,
      role: isSuperAdmin ? 'admin' : 'student',
      isVerified: true,
      status: 'Active'
    });

    console.log('✅ User created:', user._id, 'Role:', user.role);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      college: user.college,
      department: user.department,
      year: user.year,
      role: user.role,
      profileImage: user.profileImage,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('📝 Login attempt:', { email });

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Ensure only process.env.ADMIN_EMAIL has admin role
    const adminEmail = (process.env.ADMIN_EMAIL || 'aryanjyoti.31@gmail.com').toLowerCase();
    if (user.email?.toLowerCase() === adminEmail) {
      if (user.role !== 'admin') {
        user.role = 'admin';
        user.isVerified = true;
        await user.save();
        console.log(`👑 Verified Admin role for ${user.name} (${user.email})`);
      }
    } else {
      if (user.role === 'admin') {
        user.role = 'student';
        await user.save();
        console.log(`🛡️ Demoted unauthorized admin to student for ${user.name} (${user.email})`);
      }
    }

    console.log('✅ Login successful:', user._id, 'Role:', user.role);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      college: user.college,
      department: user.department,
      year: user.year,
      role: user.role,
      profileImage: user.profileImage,
      token: generateToken(user._id, user.role)
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

    if (user) {
      const adminEmail = (process.env.ADMIN_EMAIL || 'aryanjyoti.31@gmail.com').toLowerCase();
      if (user.email?.toLowerCase() === adminEmail) {
        if (user.role !== 'admin') {
          user.role = 'admin';
          user.isVerified = true;
          await user.save();
        }
      } else {
        if (user.role === 'admin') {
          user.role = 'student';
          await user.save();
        }
      }
    }

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