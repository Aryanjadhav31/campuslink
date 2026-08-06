const User = require('../models/User');
const APPROVED_COLLEGES = require('../constants/colleges');
const bcrypt = require('bcryptjs');

const MASTER_DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Artificial Intelligence & Machine Learning',
  'Electronics & Telecommunication Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Production Engineering',
  'Robotics and Automation',
  'Instrumentation Engineering',
  'Data Science',
  'Cyber Security',
  'Electronics Engineering'
];

const MASTER_YEARS = [
  'First Year',
  'Second Year',
  'Third Year',
  'Final Year'
];

// @desc    Get distinct filter options for Student Directory (colleges, departments, years)
// @route   GET /api/users/filter-options
// @access  Private
const getFilterOptions = async (req, res) => {
  try {
    const dbDepartments = await User.distinct('department', { department: { $ne: null, $ne: '' } });
    const dbYears = await User.distinct('year', { year: { $ne: null, $ne: '' } });

    const combinedDepartments = Array.from(new Set([...MASTER_DEPARTMENTS, ...dbDepartments.filter(Boolean)])).sort();
    const combinedYears = Array.from(new Set([...MASTER_YEARS, ...dbYears.filter(Boolean)])).sort();

    res.json({
      colleges: APPROVED_COLLEGES,
      departments: combinedDepartments,
      years: combinedYears
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const escapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

// @desc    Get all student users (with search, filtering, and sorting)
// @route   GET /api/users or GET /api/students
// @access  Private
const getUsers = async (req, res) => {
  try {
    const { search, college, department, year, academicYear, skill, interest, sort } = req.query;

    const targetYear = year || academicYear;

    // Ensure all registered accounts are marked verified for directory discovery
    await User.updateMany({ isVerified: false }, { $set: { isVerified: true } });

    // The query MUST exclude ONLY the currently logged-in user!
    // No role restrictions, no account restrictions!
    let query = {
      _id: { $ne: req.user._id },
      isVerified: { $ne: false }
    };

    // 1. Dynamic College Filter
    if (college && college.trim() && college !== 'All Colleges') {
      const c = college.trim();
      query.college = { $regex: new RegExp(escapeRegex(c), 'i') };
    }

    // 2. Dynamic Department Filter (Normalizing CSE / IT / ENTC acronyms & whitespace)
    if (department && department.trim() && department !== 'All Departments') {
      const d = department.trim();
      const baseDept = d.replace(/\s*\([^)]*\)/g, '').trim();
      const escapedBase = escapeRegex(baseDept);
      const escapedOriginal = escapeRegex(d);
      
      query.department = { $regex: new RegExp(`${escapedBase}|${escapedOriginal}`, 'i') };
    }

    // 3. Dynamic Academic Year Filter (Matching 1st / First Year / 1 / 2nd / 2 / 3rd / 3 / 4th / 4 / Final Year)
    if (targetYear && targetYear.trim() && targetYear !== 'All Years') {
      const y = targetYear.trim();
      if (/first|1st|1\b/i.test(y)) {
        query.year = { $regex: /first|1st|1/i };
      } else if (/second|2nd|2\b/i.test(y)) {
        query.year = { $regex: /second|2nd|2/i };
      } else if (/third|3rd|3\b/i.test(y)) {
        query.year = { $regex: /third|3rd|3/i };
      } else if (/final|fourth|4th|graduated|4\b/i.test(y)) {
        query.year = { $regex: /final|fourth|4th|graduated|4/i };
      } else {
        query.year = { $regex: new RegExp(escapeRegex(y), 'i') };
      }
    }

    // 4. Dynamic Search Filter (Name, Username, Email, College, Department, Skills)
    if (search && search.trim()) {
      const s = search.trim();
      const regex = new RegExp(escapeRegex(s), 'i');
      query.$or = [
        { name: { $regex: regex } },
        { username: { $regex: regex } },
        { email: { $regex: regex } },
        { college: { $regex: regex } },
        { department: { $regex: regex } },
        { skills: { $regex: regex } }
      ];
    }

    if (skill && skill.trim()) query.skills = { $regex: new RegExp(escapeRegex(skill.trim()), 'i') };
    if (interest && interest.trim()) query.interests = { $regex: new RegExp(escapeRegex(interest.trim()), 'i') };

    let sortOptions = { name: 1 }; // Default Name A-Z

    if (sort === 'name_za' || sort === 'name_desc') {
      sortOptions = { name: -1 };
    } else if (sort === 'newest' || sort === 'recently_joined') {
      sortOptions = { createdAt: -1 };
    } else if (sort === 'placement' || sort === 'placement_readiness') {
      sortOptions = { skills: -1, createdAt: -1 };
    } else if (sort === 'active' || sort === 'most_active') {
      sortOptions = { updatedAt: -1, createdAt: -1 };
    } else if (sort === 'college') {
      sortOptions = { college: 1, name: 1 };
    } else if (sort === 'department') {
      sortOptions = { department: 1, name: 1 };
    }

    console.log(`🔍 [Student Search Query] Logged-in User: ${req.user.name} (${req.user._id}, role: ${req.user.role})`);
    console.log(`   Filters received:`, { college, department, year: targetYear, search, sort });
    console.log(`   MongoDB Query:`, JSON.stringify(query));

    const users = await User.find(query)
      .select('-password')
      .populate('friends', 'name profileImage')
      .sort(sortOptions);

    console.log(`   -> Returned ${users.length} matching student(s).`);

    // Sanitize email based on privacy settings
    const sanitizedUsers = users.map(u => {
      const userObj = u.toObject();
      if (userObj.settings?.privacy?.showEmail === false) {
        delete userObj.email;
      }
      return userObj;
    });

    res.json(sanitizedUsers);
  } catch (error) {
    console.error('❌ Error in getUsers search controller:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('friends', 'name profileImage isOnline');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userObj = user.toObject();

    // Enforce privacy settings when viewed by others
    if (user._id.toString() !== req.user._id.toString()) {
      const visibility = user.settings?.privacy?.profileVisibility || 'public';
      const isFriend = user.friends.some(f => f._id.toString() === req.user._id.toString());

      if (visibility === 'private' || (visibility === 'friends' && !isFriend)) {
        return res.status(403).json({
          message: 'This profile is private.',
          isPrivate: true,
          _id: user._id,
          name: user.name,
          username: user.username,
          profileImage: user.profileImage
        });
      }

      if (user.settings?.privacy?.showEmail === false) {
        delete userObj.email;
      }
    }

    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      username,
      bio,
      college,
      department,
      year,
      skills,
      interests,
      lookingFor,
      socialLinks,
      location,
      profileImage
    } = req.body;

    const user = await User.findById(req.user._id);

    if (college && !APPROVED_COLLEGES.includes(college)) {
      return res.status(400).json({ message: 'Selected college is invalid. Please select an approved engineering college.' });
    }

    // Validate username uniqueness if changed
    if (username && username.trim() !== user.username) {
      const formattedUsername = username.trim().toLowerCase();
      const existingUser = await User.findOne({
        username: formattedUsername,
        _id: { $ne: req.user._id }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken. Please choose another.' });
      }
      user.username = formattedUsername;
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio;
    if (college) user.college = college;
    if (department) user.department = department;
    if (year) user.year = year;
    if (skills !== undefined) user.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean);
    if (interests !== undefined) user.interests = Array.isArray(interests) ? interests : interests.split(',').map(i => i.trim()).filter(Boolean);
    if (lookingFor) user.lookingFor = lookingFor;
    if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };
    if (location !== undefined) user.location = location;
    if (profileImage) user.profileImage = profileImage;

    const updatedUser = await user.save();
    const resultObj = updatedUser.toObject();
    delete resultObj.password;
    res.json(resultObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user password (Security Tab)
// @route   PUT /api/users/password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password cannot be the same as your current password.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.json({ message: 'Password updated successfully! 🎉' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update privacy settings
// @route   PUT /api/users/settings/privacy
// @access  Private
const updatePrivacy = async (req, res) => {
  try {
    const { profileVisibility, showEmail } = req.body;

    const user = await User.findById(req.user._id);
    if (!user.settings) user.settings = {};
    if (!user.settings.privacy) user.settings.privacy = {};

    if (profileVisibility !== undefined) {
      user.settings.privacy.profileVisibility = profileVisibility;
    }
    if (showEmail !== undefined) {
      user.settings.privacy.showEmail = Boolean(showEmail);
    }

    const updatedUser = await user.save();
    const resultObj = updatedUser.toObject();
    delete resultObj.password;
    res.json(resultObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update notification settings
// @route   PUT /api/users/settings/notifications
// @access  Private
const updateNotifications = async (req, res) => {
  try {
    const notificationsData = req.body;

    const user = await User.findById(req.user._id);
    if (!user.settings) user.settings = {};

    user.settings.notifications = {
      ...user.settings.notifications,
      ...notificationsData
    };

    const updatedUser = await user.save();
    const resultObj = updatedUser.toObject();
    delete resultObj.password;
    res.json(resultObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appearance settings (Theme)
// @route   PUT /api/users/settings/appearance
// @access  Private
const updateAppearance = async (req, res) => {
  try {
    const { theme } = req.body;

    if (!['dark', 'light', 'system'].includes(theme)) {
      return res.status(400).json({ message: 'Invalid theme selection.' });
    }

    const user = await User.findById(req.user._id);
    if (!user.settings) user.settings = {};
    if (!user.settings.appearance) user.settings.appearance = {};

    user.settings.appearance.theme = theme;

    const updatedUser = await user.save();
    const resultObj = updatedUser.toObject();
    delete resultObj.password;
    res.json(resultObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get suggested friends
// @route   GET /api/users/suggestions
// @access  Private
const getSuggestions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const suggestions = await User.find({
      _id: { $ne: req.user._id, $nin: user.friends },
      $or: [
        { college: user.college },
        { department: user.department },
        { interests: { $in: user.interests } }
      ]
    })
      .select('-password')
      .limit(10);

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFilterOptions,
  getUsers,
  getUserById,
  updateProfile,
  updatePassword,
  updatePrivacy,
  updateNotifications,
  updateAppearance,
  getSuggestions
};