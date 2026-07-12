const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send message
// @route   POST /api/chat/send
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, image } = req.body;
    
    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      message,
      image
    });

    await newMessage.populate('sender', 'name profileImage');
    await newMessage.populate('receiver', 'name profileImage');

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages between users
// @route   GET /api/chat/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ],
      isDeleted: false
    })
    .populate('sender', 'name profileImage')
    .populate('receiver', 'name profileImage')
    .sort({ createdAt: 1 });

    // ✅ Always return an array
    res.json(messages || []);
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    // ✅ Return empty array on error
    res.json([]);
  }
};

// @desc    Get chat users
// @route   GET /api/chat/users
// @access  Private
const getChatUsers = async (req, res) => {
  try {
    // ✅ Get user's friends
    const user = await User.findById(req.user._id)
      .populate('friends', 'name profileImage isOnline lastSeen');
    
    if (!user) {
      return res.json([]);
    }
    
    // ✅ Ensure we return an array
    const friends = user.friends || [];
    res.json(friends);
    
  } catch (error) {
    console.error('❌ Error fetching chat users:', error);
    // ✅ Return empty array on error
    res.json([]);
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/read/:userId
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    
    await Message.updateMany(
      {
        sender: userId,
        receiver: req.user._id,
        isRead: false
      },
      {
        isRead: true,
        readAt: Date.now()
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('❌ Error marking as read:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete message
// @route   DELETE /api/chat/messages/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    message.isDeleted = true;
    await message.save();

    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('❌ Error deleting message:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getChatUsers,
  markAsRead,
  deleteMessage
};