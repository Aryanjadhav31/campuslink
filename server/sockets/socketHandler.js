const Message = require('../models/Message');
const User = require('../models/User');

const socketHandler = (socket, io) => {
  console.log('New client connected:', socket.id);

  // User joins their room
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
    
    // Mark user as online
    User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: Date.now() })
      .then(() => {
        io.emit('user-online', userId);
      });
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);
    
    // Find user by socket id and mark as offline
    const user = await User.findOne({ _id: socket.userId });
    if (user) {
      user.isOnline = false;
      user.lastSeen = Date.now();
      await user.save();
      io.emit('user-offline', user._id);
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
      io.to(receiverId).emit('new-message', newMessage);
      
      // Send back to sender
      socket.emit('message-sent', newMessage);

      // Send notification to receiver
      io.to(receiverId).emit('notification', {
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
    io.to(receiverId).emit('user-typing', {
      userId: socket.userId,
      isTyping
    });
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
      io.to(message.sender.toString()).emit('message-read', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  // Store user ID for disconnection
  socket.on('set-user', (userId) => {
    socket.userId = userId;
    socket.join(userId);
  });

  // Friend request notification
  socket.on('friend-request', (data) => {
    const { receiverId, senderName } = data;
    io.to(receiverId).emit('notification', {
      type: 'friend_request',
      message: `${senderName} sent you a friend request`,
      from: socket.userId
    });
  });

  // Friend request accepted
  socket.on('friend-accepted', (data) => {
    const { receiverId, senderName } = data;
    io.to(receiverId).emit('notification', {
      type: 'friend_accept',
      message: `${senderName} accepted your friend request`,
      from: socket.userId
    });
  });
};

module.exports = socketHandler;