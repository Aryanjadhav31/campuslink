const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Send friend request
// @route   POST /api/friends/request
// @access  Private
const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    
    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId, receiver: req.user._id }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    const friendRequest = await FriendRequest.create({
      sender: req.user._id,
      receiver: receiverId
    });

    // Create notification
    await Notification.create({
      user: receiverId,
      type: 'friend_request',
      message: `${req.user.name} sent you a friend request`,
      from: req.user._id,
      link: `/profile/${req.user._id}`
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept friend request
// @route   POST /api/friends/accept
// @access  Private
const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    
    const friendRequest = await FriendRequest.findById(requestId);
    
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (friendRequest.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    friendRequest.status = 'accepted';
    await friendRequest.save();

    // Add to friends list
    await User.findByIdAndUpdate(req.user._id, {
      $push: { friends: friendRequest.sender }
    });

    await User.findByIdAndUpdate(friendRequest.sender, {
      $push: { friends: req.user._id }
    });

    // Create notification
    await Notification.create({
      user: friendRequest.sender,
      type: 'friend_accept',
      message: `${req.user.name} accepted your friend request`,
      from: req.user._id,
      link: `/profile/${req.user._id}`
    });

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject friend request
// @route   POST /api/friends/reject
// @access  Private
const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    
    const friendRequest = await FriendRequest.findById(requestId);
    
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (friendRequest.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    friendRequest.status = 'rejected';
    await friendRequest.save();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get friend requests
// @route   GET /api/friends/requests
// @access  Private
const getFriendRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      receiver: req.user._id,
      status: 'pending'
    })
    .populate('sender', 'name profileImage college department');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get friends list
// @route   GET /api/friends
// @access  Private
const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'name profileImage isOnline college department');
    
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove friend
// @route   DELETE /api/friends/:friendId
// @access  Private
const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { friends: friendId }
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: req.user._id }
    });

    res.json({ message: 'Friend removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getFriends,
  removeFriend
};