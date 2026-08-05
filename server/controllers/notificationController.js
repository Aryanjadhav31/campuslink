const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate('from', 'name profileImage college department username')
      .sort({ createdAt: -1 });
    
    // ✅ Always return an array
    res.json(notifications || []);
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ message: error.message || 'Error fetching notifications' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('❌ Error marking as read:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('❌ Error marking all as read:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await notification.deleteOne();
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};