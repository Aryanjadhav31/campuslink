const Community = require('../models/Community');
const Post = require('../models/Post');

// @desc    Create community
// @route   POST /api/communities
// @access  Private
const createCommunity = async (req, res) => {
  try {
    const { name, description, category, isPrivate } = req.body;
    
    const existingCommunity = await Community.findOne({ name });
    if (existingCommunity) {
      return res.status(400).json({ message: 'Community name already exists' });
    }

    const community = await Community.create({
      name,
      description,
      category,
      isPrivate,
      admin: req.user._id,
      members: [req.user._id]
    });

    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all communities
// @route   GET /api/communities
// @access  Private
const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find({
      $or: [
        { isPrivate: false },
        { members: req.user._id }
      ]
    })
    .populate('admin', 'name profileImage')
    .populate('members', 'name');

    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get community by ID
// @route   GET /api/communities/:id
// @access  Private
const getCommunityById = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('admin', 'name profileImage')
      .populate('members', 'name profileImage isOnline');
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user can view private community
    if (community.isPrivate && !community.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get community posts
    const posts = await Post.find({ community: community._id })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ community, posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join community
// @route   POST /api/communities/:id/join
// @access  Private
const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (community.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    community.members.push(req.user._id);
    await community.save();

    res.json({ message: 'Joined community' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave community
// @route   POST /api/communities/:id/leave
// @access  Private
const leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (community.admin.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin cannot leave community' });
    }

    community.members = community.members.filter(id => id.toString() !== req.user._id.toString());
    await community.save();

    res.json({ message: 'Left community' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCommunity,
  getCommunities,
  getCommunityById,
  joinCommunity,
  leaveCommunity
};