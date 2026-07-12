const User = require('../models/User');

// @desc    Get all users (with filters)
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const { search, college, department, year, skill, interest } = req.query;
    
    let query = { _id: { $ne: req.user._id } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (college) query.college = college;
    if (department) query.department = department;
    if (year) query.year = year;
    if (skill) query.skills = skill;
    if (interest) query.interests = interest;

    const users = await User.find(query)
      .select('-password')
      .populate('friends', 'name');
    
    res.json(users);
  } catch (error) {
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

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, bio, college, department, year, skills, interests, lookingFor, socialLinks } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (college) user.college = college;
    if (department) user.department = department;
    if (year) user.year = year;
    if (skills) user.skills = skills;
    if (interests) user.interests = interests;
    if (lookingFor) user.lookingFor = lookingFor;
    if (socialLinks) user.socialLinks = socialLinks;

    const updatedUser = await user.save();
    res.json(updatedUser);
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
    
    // Find users with similar interests, department, or college
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
  getUsers,
  getUserById,
  updateProfile,
  getSuggestions
};