const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Auto-ensure admin role for main user "Aryan" if matched
      if (req.user.name?.toLowerCase().includes('aryan') || req.user.email?.toLowerCase().includes('aryan') || req.user.email?.toLowerCase().includes('admin')) {
        if (req.user.role !== 'admin') {
          req.user.role = 'admin';
          await User.findByIdAndUpdate(req.user._id, { role: 'admin', isVerified: true });
          console.log(`👑 Auto-verified admin role for ${req.user.name}`);
        }
      }

      return next();
    } catch (error) {
      console.error('❌ Auth error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
  console.log(`🛡️ Admin Authorization Check: User=${req.user?.name} (${req.user?._id}), Role=${req.user?.role}`);
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    console.warn(`⛔ Access Denied for User=${req.user?.name} (Role=${req.user?.role}). Admin required.`);
    res.status(403).json({ message: 'Access denied: Admin role required' });
  }
};

module.exports = { protect, adminOnly };