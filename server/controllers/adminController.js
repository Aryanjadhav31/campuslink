const User = require('../models/User');
const Post = require('../models/Post');
const AdminAuditLog = require('../models/AdminAuditLog');
const FriendRequest = require('../models/FriendRequest');
const Community = require('../models/Community');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');

const isPrimarySuperAdmin = (user) => {
  if (!user) return false;
  const email = (user.email || '').toLowerCase();
  return email.includes('aryan') || email.includes('admin.campuslink');
};

const escapeRegex = (s) => (s || '').replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

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

// 1. GET /api/admin/stats - 13 Real-time MongoDB Statistics
const getStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      verifiedStudents,
      pendingStudents,
      admins,
      activeUsers,
      inactiveUsers,
      postsCreated,
      friendRequests,
      communities,
      events,
      todayRegistrations,
      weeklyRegistrations,
      monthlyRegistrations
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true, role: 'student' }),
      User.countDocuments({ isVerified: false }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ isOnline: true }),
      User.countDocuments({ isOnline: false }),
      Post.countDocuments(),
      FriendRequest.countDocuments(),
      Community.countDocuments(),
      Event.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
      User.countDocuments({ createdAt: { $gte: startOfWeek } }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } })
    ]);

    res.json({
      totalUsers,
      verifiedStudents,
      pendingStudents,
      admins,
      activeUsers,
      inactiveUsers,
      postsCreated,
      friendRequests,
      communities,
      events,
      todayRegistrations,
      weeklyRegistrations,
      monthlyRegistrations
    });
  } catch (error) {
    console.error('Admin getStats error:', error);
    res.status(500).json({ message: 'Failed to retrieve stats' });
  }
};

// 2. GET /api/admin/users - Multi-filter & Search User List
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search ? req.query.search.trim() : '';
    const college = req.query.college ? req.query.college.trim() : '';
    const department = req.query.department ? req.query.department.trim() : '';
    const year = req.query.year ? req.query.year.trim() : '';
    const role = req.query.role ? req.query.role.trim() : '';
    const isVerified = req.query.isVerified ? req.query.isVerified.trim() : '';
    const status = req.query.status ? req.query.status.trim() : '';
    const sort = req.query.sort ? req.query.sort.trim() : 'newest';

    const skip = (page - 1) * limit;
    let query = {};

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), 'i');
      query.$or = [
        { name: searchRegex },
        { username: searchRegex },
        { email: searchRegex },
        { college: searchRegex },
        { department: searchRegex },
        { role: searchRegex }
      ];
    }

    if (college && college !== 'All Colleges') {
      query.college = { $regex: new RegExp(escapeRegex(college), 'i') };
    }

    if (department && department !== 'All Departments') {
      const baseDept = department.replace(/\s*\([^)]*\)/g, '').trim();
      query.department = { $regex: new RegExp(`${escapeRegex(baseDept)}|${escapeRegex(department)}`, 'i') };
    }

    if (year && year !== 'All Years') {
      if (/first|1st|1\b/i.test(year)) query.year = { $regex: /first|1st|1/i };
      else if (/second|2nd|2\b/i.test(year)) query.year = { $regex: /second|2nd|2/i };
      else if (/third|3rd|3\b/i.test(year)) query.year = { $regex: /third|3rd|3/i };
      else if (/final|fourth|4th|graduated|4\b/i.test(year)) query.year = { $regex: /final|fourth|4th|graduated|4/i };
      else query.year = { $regex: new RegExp(escapeRegex(year), 'i') };
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    if (isVerified && isVerified !== 'all') {
      query.isVerified = isVerified === 'verified';
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'name_asc') sortOption = { name: 1 };
    else if (sort === 'name_desc') sortOption = { name: -1 };

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort(sortOption)
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

// 3. GET /api/admin/users/:id/details - Side Drawer Metadata & Counts
const getUserDetails = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const user = await User.findById(targetUserId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [postsCount, notificationsCount] = await Promise.all([
      Post.countDocuments({ user: targetUserId }),
      Notification.countDocuments({ user: targetUserId })
    ]);

    const friendsCount = Array.isArray(user.friends) ? user.friends.length : 0;

    res.json({
      user,
      stats: {
        postsCount,
        friendsCount,
        notificationsCount
      }
    });
  } catch (error) {
    console.error('Admin getUserDetails error:', error);
    res.status(500).json({ message: 'Failed to retrieve user details' });
  }
};

// 4. POST /api/admin/users
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
      year: year || '1st Year',
      role: role === 'admin' ? 'admin' : 'student',
      isVerified: true,
      status: 'Active'
    });

    await logAdminAction(req.user, 'USER_CREATED', newUser, `Created user account with role ${newUser.role}`);

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

// 5. DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (isPrimarySuperAdmin(targetUser)) {
      return res.status(400).json({ message: 'This is the primary system administrator and cannot be modified or deleted.' });
    }

    if (req.user._id.toString() === targetUserId) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    await Post.deleteMany({ user: targetUserId });
    await Post.updateMany(
      { 'comments.user': targetUserId },
      { $pull: { comments: { user: targetUserId } } }
    );
    await Post.updateMany(
      { likes: targetUserId },
      { $pull: { likes: targetUserId } }
    );
    await User.updateMany(
      { friends: targetUserId },
      { $pull: { friends: targetUserId } }
    );
    await FriendRequest.deleteMany({
      $or: [{ sender: targetUserId }, { receiver: targetUserId }]
    });

    await User.findByIdAndDelete(targetUserId);

    await logAdminAction(req.user, 'USER_DELETED', targetUser, `Deleted user account ${targetUser.email}`);

    res.json({ message: 'User account and associated data deleted successfully' });
  } catch (error) {
    console.error('Admin deleteUser error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// 6. PATCH /api/admin/users/:id/role
const changeUserRole = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const { role } = req.body;

    if (!['student', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({ message: 'Role must be student, admin, or moderator' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (isPrimarySuperAdmin(targetUser) && role !== 'admin') {
      return res.status(400).json({ message: 'This is the primary system administrator and cannot be demoted.' });
    }

    if (targetUser.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot demote the only admin in the system' });
      }
    }

    const previousRole = targetUser.role;
    targetUser.role = role;
    await targetUser.save();

    await logAdminAction(req.user, 'ROLE_CHANGED', targetUser, `Changed role from ${previousRole} to ${role}`);

    res.json({
      message: `User role updated to ${role}`,
      role: targetUser.role
    });
  } catch (error) {
    console.error('Admin changeUserRole error:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

// 7. PATCH /api/admin/users/:id/verify
const toggleVerification = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (isPrimarySuperAdmin(targetUser) && targetUser.isVerified) {
      return res.status(400).json({ message: 'This is the primary system administrator and cannot be unverified.' });
    }

    targetUser.isVerified = !targetUser.isVerified;
    await targetUser.save();

    const actionText = targetUser.isVerified ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REMOVED';
    await logAdminAction(req.user, actionText, targetUser, `Updated verification status to ${targetUser.isVerified ? 'Verified' : 'Pending'}`);

    res.json({
      message: `Student verification updated to ${targetUser.isVerified ? 'Verified' : 'Pending'}`,
      isVerified: targetUser.isVerified
    });
  } catch (error) {
    console.error('Admin toggleVerification error:', error);
    res.status(500).json({ message: 'Failed to update verification status' });
  }
};

// 8. PATCH /api/admin/users/:id/suspend
const toggleSuspend = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (isPrimarySuperAdmin(targetUser)) {
      return res.status(400).json({ message: 'This is the primary system administrator and cannot be suspended.' });
    }

    targetUser.status = targetUser.status === 'Suspended' ? 'Active' : 'Suspended';
    await targetUser.save();

    const actionText = targetUser.status === 'Suspended' ? 'USER_SUSPENDED' : 'USER_ACTIVATED';
    await logAdminAction(req.user, actionText, targetUser, `Updated account status to ${targetUser.status}`);

    res.json({
      message: `Account status updated to ${targetUser.status}`,
      status: targetUser.status
    });
  } catch (error) {
    console.error('Admin toggleSuspend error:', error);
    res.status(500).json({ message: 'Failed to update account status' });
  }
};

// 9. PATCH /api/admin/users/:id/password
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

    await logAdminAction(req.user, 'PASSWORD_RESET', targetUser, `Reset password for user ${targetUser.email}`);

    res.json({ message: 'User password reset successfully' });
  } catch (error) {
    console.error('Admin resetPassword error:', error);
    res.status(500).json({ message: 'Failed to reset user password' });
  }
};

// 10. GET /api/admin/audit-logs
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AdminAuditLog.find()
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    console.error('Admin getAuditLogs error:', error);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
};

module.exports = {
  getStats,
  getUsers,
  getUserDetails,
  createUser,
  deleteUser,
  changeUserRole,
  toggleVerification,
  toggleSuspend,
  resetPassword,
  getAuditLogs
};
