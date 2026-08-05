const mongoose = require('mongoose');
const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Send friend request
// @route   POST /api/friends/request or POST /api/friends/request/:id
// @access  Private
const sendFriendRequest = async (req, res) => {
  try {
    const receiverId = req.params.id || req.body.receiverId || req.body.id;
    const senderId = req.user._id;

    console.log(`📩 Friend Request Attempt: Sender=${senderId} (${req.user.name}) -> Receiver=${receiverId}`);

    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: 'Invalid receiver ID format' });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ message: 'You cannot send a friend request to yourself' });
    }

    // Check if receiver exists
    const receiverUser = await User.findById(receiverId);
    if (!receiverUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already friends
    const senderUser = await User.findById(senderId);
    if (senderUser.friends && senderUser.friends.some(f => f.toString() === receiverId.toString())) {
      return res.status(400).json({ message: 'You are already friends with this user' });
    }

    // Check existing request
    let existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        if (existingRequest.sender.toString() === senderId.toString()) {
          return res.status(400).json({ message: 'Friend request already sent' });
        } else {
          return res.status(400).json({ message: 'This user has already sent you a friend request. Check your notifications!' });
        }
      }
      if (existingRequest.status === 'accepted') {
        return res.status(400).json({ message: 'You are already friends' });
      }
      // If previously rejected, allow re-sending by updating status back to pending
      if (existingRequest.status === 'rejected') {
        existingRequest.sender = senderId;
        existingRequest.receiver = receiverId;
        existingRequest.status = 'pending';
        await existingRequest.save();
      }
    } else {
      existingRequest = await FriendRequest.create({
        sender: senderId,
        receiver: receiverId,
        status: 'pending'
      });
    }

    // Create Notification for Receiver
    const notification = await Notification.create({
      user: receiverId,
      type: 'friend_request',
      message: `${req.user.name} sent you a friend request.`,
      from: senderId,
      link: `/notifications`,
      read: false
    });

    const populatedNotification = await Notification.findById(notification._id)
      .populate('from', 'name profileImage college department username');

    // Emit Socket Events if available
    const io = req.app.get('io');
    if (io) {
      io.to(receiverId.toString()).emit('notification', populatedNotification);
      io.to(receiverId.toString()).emit('friend_request', {
        request: existingRequest,
        notification: populatedNotification
      });
      io.to(receiverId.toString()).emit('new_notification', populatedNotification);
    }

    console.log(`✅ Friend Request Created Successfully: RequestId=${existingRequest._id}`);

    res.status(201).json({
      message: 'Friend request sent successfully',
      friendRequest: existingRequest,
      notification: populatedNotification
    });
  } catch (error) {
    console.error('❌ Error sending friend request:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// @desc    Accept friend request
// @route   POST /api/friends/accept or POST /api/friends/accept/:id
// @access  Private
const acceptFriendRequest = async (req, res) => {
  try {
    const requestId = req.params.id || req.body.requestId || req.body.id;
    const userId = req.user._id;

    console.log(`🤝 Accept Friend Request Attempt: User=${userId} (${req.user.name}), TargetId=${requestId}`);

    if (!requestId) {
      return res.status(400).json({ message: 'Request ID or User ID is required' });
    }

    let friendRequest;
    if (mongoose.Types.ObjectId.isValid(requestId)) {
      // First try to find by FriendRequest ID
      friendRequest = await FriendRequest.findById(requestId);
      
      // If not found by Request ID, try finding by Sender ID where current user is Receiver
      if (!friendRequest) {
        friendRequest = await FriendRequest.findOne({
          sender: requestId,
          receiver: userId,
          status: 'pending'
        });
      }
    }

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (friendRequest.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this request' });
    }

    if (friendRequest.status === 'accepted') {
      return res.status(400).json({ message: 'Friend request already accepted' });
    }

    // Update status
    friendRequest.status = 'accepted';
    await friendRequest.save();

    // Atomic update to add to friends array for both users
    await User.findByIdAndUpdate(userId, {
      $addToSet: { friends: friendRequest.sender }
    });

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: userId }
    });

    // Create Notification for Sender
    const notification = await Notification.create({
      user: friendRequest.sender,
      type: 'friend_accept',
      message: `${req.user.name} accepted your friend request.`,
      from: userId,
      link: `/students/${userId}`,
      read: false
    });

    const populatedNotification = await Notification.findById(notification._id)
      .populate('from', 'name profileImage college department username');

    // Socket Emissions
    const io = req.app.get('io');
    if (io) {
      io.to(friendRequest.sender.toString()).emit('notification', populatedNotification);
      io.to(friendRequest.sender.toString()).emit('request_accepted', {
        requestId: friendRequest._id,
        user: { _id: req.user._id, name: req.user.name, profileImage: req.user.profileImage }
      });
      io.to(friendRequest.sender.toString()).emit('new_notification', populatedNotification);
    }

    console.log(`✅ Friend Request Accepted: RequestId=${friendRequest._id}`);

    res.json({
      message: 'Friend request accepted successfully',
      friendRequest
    });
  } catch (error) {
    console.error('❌ Error accepting friend request:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// @desc    Reject friend request
// @route   POST /api/friends/reject or POST /api/friends/reject/:id
// @access  Private
const rejectFriendRequest = async (req, res) => {
  try {
    const requestId = req.params.id || req.body.requestId || req.body.id;
    const userId = req.user._id;

    console.log(`🚫 Reject Friend Request Attempt: User=${userId} (${req.user.name}), TargetId=${requestId}`);

    if (!requestId) {
      return res.status(400).json({ message: 'Request ID or User ID is required' });
    }

    let friendRequest;
    if (mongoose.Types.ObjectId.isValid(requestId)) {
      friendRequest = await FriendRequest.findById(requestId);
      if (!friendRequest) {
        friendRequest = await FriendRequest.findOne({
          sender: requestId,
          receiver: userId,
          status: 'pending'
        });
      }
    }

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (friendRequest.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this request' });
    }

    if (friendRequest.status === 'rejected') {
      return res.status(400).json({ message: 'Friend request already rejected' });
    }

    friendRequest.status = 'rejected';
    await friendRequest.save();

    // Create Notification for Sender
    const notification = await Notification.create({
      user: friendRequest.sender,
      type: 'friend_reject',
      message: `${req.user.name} rejected your friend request.`,
      from: userId,
      link: `/notifications`,
      read: false
    });

    const populatedNotification = await Notification.findById(notification._id)
      .populate('from', 'name profileImage college department username');

    // Socket Emissions
    const io = req.app.get('io');
    if (io) {
      io.to(friendRequest.sender.toString()).emit('notification', populatedNotification);
      io.to(friendRequest.sender.toString()).emit('request_rejected', {
        requestId: friendRequest._id,
        user: { _id: req.user._id, name: req.user.name }
      });
      io.to(friendRequest.sender.toString()).emit('new_notification', populatedNotification);
    }

    console.log(`✅ Friend Request Rejected: RequestId=${friendRequest._id}`);

    res.json({
      message: 'Friend request rejected',
      friendRequest
    });
  } catch (error) {
    console.error('❌ Error rejecting friend request:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// @desc    Get friend requests (Incoming and optionally Outgoing)
// @route   GET /api/friends/requests
// @access  Private
const getFriendRequests = async (req, res) => {
  try {
    const { type } = req.query;

    if (type === 'all') {
      const allRequests = await FriendRequest.find({
        $or: [
          { receiver: req.user._id },
          { sender: req.user._id }
        ],
        status: 'pending'
      })
      .populate('sender', 'name profileImage college department username')
      .populate('receiver', 'name profileImage college department username')
      .sort({ createdAt: -1 });

      return res.json(allRequests);
    }

    // Default: Return incoming pending requests
    const requests = await FriendRequest.find({
      receiver: req.user._id,
      status: 'pending'
    })
    .populate('sender', 'name profileImage college department username')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('❌ Error getting friend requests:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// @desc    Get friends list
// @route   GET /api/friends
// @access  Private
const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'name profileImage isOnline college department username email bio');
    
    res.json(user.friends || []);
  } catch (error) {
    console.error('❌ Error getting friends:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// @desc    Remove friend
// @route   DELETE /api/friends/:friendId
// @access  Private
const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(friendId)) {
      return res.status(400).json({ message: 'Invalid friend ID' });
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId }
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId }
    });

    // Also update any friend requests between them to rejected or remove them
    await FriendRequest.deleteMany({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId }
      ]
    });

    console.log(`✅ Friend Removed: User=${userId}, Friend=${friendId}`);

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('❌ Error removing friend:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
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