const User = require('../models/User');
const Post = require('../models/Post');
const AdminAuditLog = require('../models/AdminAuditLog');
const bcrypt = require('bcryptjs');

// Helper to log admin actions
const logAdminAction = async (adminUser, action, targetUser = null, details = '') => {
  try {
    await AdminAuditLog.create({
      admin: adminUser._id,
      adminName: adminUser.name,
      action,
      targetUser: targetUser ? targetUser._id : null,
      targetUserName: targetUser ? targetUser.name : '',
      details: typeof details === 'object' ? JSON.stringify(details) : details
    });
  } catch (err) {
    console.error('Failed to record admin audit log:', err);
  }
};

// 1. GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search ? req.query.search.trim() : '';
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = {
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { college: searchRegex },
          { department: searchRegex }
        ]
      };
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalUsers / limit) || 1;

    res.json({
      users,
      totalUsers,
      page,
      totalPages
    });
  } catch (error) {
    console.error('Admin getUsers error:', error);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
};

// 2. POST /api/admin/users
const createUser = async (req, res) => {
  try {
    const { name, email, password, college, department, year, role } = req.body;

    if (!name || !email || !password || !college || !department) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      college,
      department,
      year: year || '1st',
      role: role === 'admin' ? 'admin' : 'student'
    });

    await logAdminAction(req.user, 'CREATE_USER', newUser, `Created user with role ${newUser.role}`);

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({
      message: 'User created successfully',
      user: userObj
    });
  } catch (error) {
    console.error('Admin createUser error:', error);
    res.status(500).json({ message: error.message || 'Failed to create user' });
  }
};

// 3. DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    if (req.user._id.toString() === targetUserId) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Admin password confirmation check if provided
    const { adminPassword } = req.body;
    if (adminPassword) {
      const adminInDb = await User.findById(req.user._id);
      const isMatch = await bcrypt.compare(adminPassword, adminInDb.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect admin password' });
      }
    }

    // Cascade Deletes:
    // a) Remove target user's posts
    await Post.deleteMany({ user: targetUserId });

    // b) Remove comments made by target user on all posts
    await Post.updateMany(
      { 'comments.user': targetUserId },
      { $pull: { comments: { user: targetUserId } } }
    );

    // c) Remove likes by target user on all posts
    await Post.updateMany(
      { likes: targetUserId },
      { $pull: { likes: targetUserId } }
    );

    // d) Remove target user from all other users' friends arrays
    await User.updateMany(
      { friends: targetUserId },
      { $pull: { friends: targetUserId } }
    );

    // e) Delete the user account
    await User.findByIdAndDelete(targetUserId);

    await logAdminAction(req.user, 'DELETE_USER', targetUser, `Deleted user account ${targetUser.email}`);

    res.json({ message: 'User account and associated data deleted successfully' });
  } catch (error) {
    console.error('Admin deleteUser error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// 4. PATCH /api/admin/users/:id/password
const resetPassword = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    targetUser.password = await bcrypt.hash(newPassword, salt);
    await targetUser.save();

    await logAdminAction(req.user, 'RESET_PASSWORD', targetUser, `Reset password for user ${targetUser.email}`);

    res.json({ message: 'User password reset successfully' });
  } catch (error) {
    console.error('Admin resetPassword error:', error);
    res.status(500).json({ message: 'Failed to reset user password' });
  }
};

// 5. PATCH /api/admin/users/:id/role
const changeUserRole = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const { role } = req.body;

    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either student or admin' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Safety Guard: If admin is demoting themselves, check if there's at least 1 other admin
    if (req.user._id.toString() === targetUserId && role === 'student') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot demote the only admin in the system' });
      }
    }

    const previousRole = targetUser.role;
    targetUser.role = role;
    await targetUser.save();

    await logAdminAction(req.user, 'CHANGE_ROLE', targetUser, `Changed role from ${previousRole} to ${role}`);

    res.json({
      message: `User role updated to ${role}`,
      role: targetUser.role
    });
  } catch (error) {
    console.error('Admin changeUserRole error:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

// 6. GET /api/admin/audit-logs
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AdminAuditLog.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(logs);
  } catch (error) {
    console.error('Admin getAuditLogs error:', error);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
};

module.exports = {
  getUsers,
  createUser,
  deleteUser,
  resetPassword,
  changeUserRole,
  getAuditLogs
};
