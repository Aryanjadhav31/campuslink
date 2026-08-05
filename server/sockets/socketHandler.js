const Message = require('../models/Message');
const User = require('../models/User');

const socketHandler = (socket, io) => {
  console.log('⚡ Socket connected:', socket.id);

  // User joins their personal room
  socket.on('join', (userId) => {
    if (!userId) return;
    socket.userId = userId;
    socket.join(userId.toString());
    console.log(`👤 User ${userId} joined room ${userId}`);
    
    // Mark user as online
    User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: Date.now() })
      .then(() => {
        io.emit('user-online', userId);
      })
      .catch(err => console.error('Error setting user online:', err));
  });

  // Store user ID for disconnection
  socket.on('set-user', (userId) => {
    if (!userId) return;
    socket.userId = userId;
    socket.join(userId.toString());
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log('🔌 Socket disconnected:', socket.id);
    
    if (socket.userId) {
      try {
        const user = await User.findById(socket.userId);
        if (user) {
          user.isOnline = false;
          user.lastSeen = Date.now();
          await user.save();
          io.emit('user-offline', user._id);
        }
      } catch (err) {
        console.error('Error handling socket disconnect:', err);
      }
    }
  });

  // Send message
  socket.on('send-message', async (data) => {
    try {
      const { receiverId, message, image } = data;
      
      const newMessage = new Message({
        sender: socket.userId,
        receiver: receiverId,
        message,
        image
      });

      await newMessage.save();
      await newMessage.populate('sender', 'name profileImage');
      await newMessage.populate('receiver', 'name profileImage');

      // Send to receiver's room
      io.to(receiverId.toString()).emit('new-message', newMessage);
      
      // Send back to sender
      socket.emit('message-sent', newMessage);

      // Send notification to receiver
      io.to(receiverId.toString()).emit('notification', {
        type: 'message',
        message: `${newMessage.sender.name} sent you a message`,
        from: socket.userId
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { receiverId, isTyping } = data;
    if (receiverId) {
      io.to(receiverId.toString()).emit('user-typing', {
        userId: socket.userId,
        isTyping
      });
    }
  });

  // Mark message as read
  socket.on('mark-read', async (data) => {
    try {
      const { messageId } = data;
      await Message.findByIdAndUpdate(messageId, {
        isRead: true,
        readAt: Date.now()
      });
      
      const message = await Message.findById(messageId);
      if (message && message.sender) {
        io.to(message.sender.toString()).emit('message-read', messageId);
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  // Friend request notification
  socket.on('friend-request', (data) => {
    const { receiverId, senderName } = data;
    if (receiverId) {
      io.to(receiverId.toString()).emit('notification', {
        type: 'friend_request',
        message: `${senderName || 'Someone'} sent you a friend request`,
        from: socket.userId
      });
    }
  });

  // Friend request accepted
  socket.on('friend-accepted', (data) => {
    const { receiverId, senderName } = data;
    if (receiverId) {
      io.to(receiverId.toString()).emit('notification', {
        type: 'friend_accept',
        message: `${senderName || 'Someone'} accepted your friend request`,
        from: socket.userId
      });
    }
  });

  // Friend request rejected
  socket.on('friend-rejected', (data) => {
    const { receiverId, senderName } = data;
    if (receiverId) {
      io.to(receiverId.toString()).emit('notification', {
        type: 'friend_reject',
        message: `${senderName || 'Someone'} rejected your friend request`,
        from: socket.userId
      });
    }
  });
};

module.exports = socketHandler;