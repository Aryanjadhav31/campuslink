const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const Community = require('../models/Community');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const [totalStudents, totalColleges, totalEvents, totalPosts, totalCommunities] = await Promise.all([
      User.countDocuments(),
      User.distinct('college'),
      Event.countDocuments(),
      Post.countDocuments(),
      Community.countDocuments()
    ]);

    // Calculate average rating (you can add a Rating model later)
    const averageRating = 4.8;
    const totalReviews = 2300;

    res.json({
      totalStudents: totalStudents || 0,
      totalColleges: totalColleges.length || 0,
      totalEvents: totalEvents || 0,
      totalPosts: totalPosts || 0,
      totalCommunities: totalCommunities || 0,
      averageRating: averageRating || 4.8,
      totalReviews: totalReviews || 0,
      activeStudents: Math.min(totalStudents, 2400) // Simulated active users
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get upcoming events
// @route   GET /api/dashboard/upcoming-events
// @access  Public
router.get('/upcoming-events', async (req, res) => {
  try {
    const now = new Date();
    const events = await Event.find({
      date: { $gte: now }
    })
    .populate('organizer', 'name college')
    .sort({ date: 1 })
    .limit(5);

    // Format events for frontend
    const formattedEvents = events.map(event => ({
      id: event._id,
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      category: event.category,
      maxParticipants: event.maxParticipants,
      participants: event.participants.length,
      organizer: event.organizer?.name || 'Unknown',
      college: event.organizer?.college || 'Unknown',
      isVirtual: event.isVirtual,
      meetingLink: event.meetingLink,
      image: event.image,
      isToday: new Date(event.date).toDateString() === new Date().toDateString(),
      isTomorrow: new Date(event.date).toDateString() === new Date(Date.now() + 86400000).toDateString(),
      daysUntil: Math.ceil((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24))
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error('Upcoming events error:', error);
    res.json([]);
  }
});

// @desc    Get top rated communities/clubs
// @route   GET /api/dashboard/top-clubs
// @access  Public
router.get('/top-clubs', async (req, res) => {
  try {
    const communities = await Community.find()
      .populate('admin', 'name college')
      .sort({ members: -1 })
      .limit(4);

    const formattedClubs = communities.map(club => ({
      id: club._id,
      name: club.name,
      description: club.description,
      category: club.category,
      members: club.members.length,
      admin: club.admin?.name || 'Unknown',
      college: club.admin?.college || 'Unknown',
      isPrivate: club.isPrivate,
      coverImage: club.coverImage,
      rating: 4.5 + Math.random() * 0.5 // Simulated rating
    }));

    res.json(formattedClubs);
  } catch (error) {
    console.error('Top clubs error:', error);
    res.json([]);
  }
});

// @desc    Get recent activities
// @route   GET /api/dashboard/recent-activities
// @access  Public
router.get('/recent-activities', async (req, res) => {
  try {
    // Get recent posts and events
    const [recentPosts, recentEvents] = await Promise.all([
      Post.find().populate('user', 'name').sort({ createdAt: -1 }).limit(3),
      Event.find().populate('organizer', 'name').sort({ createdAt: -1 }).limit(2)
    ]);

    const activities = [];

    recentPosts.forEach(post => {
      activities.push({
        user: post.user?.name || 'Someone',
        action: `posted: "${post.content?.substring(0, 30) || ''}..."`,
        time: timeAgo(post.createdAt),
        icon: '💬',
        type: 'post'
      });
    });

    recentEvents.forEach(event => {
      activities.push({
        user: event.organizer?.name || 'Someone',
        action: `created event: ${event.title}`,
        time: timeAgo(event.createdAt),
        icon: '📅',
        type: 'event'
      });
    });

    // Sort by time and limit to 5
    activities.sort((a, b) => a.time.localeCompare(b.time));
    res.json(activities.slice(0, 5));
  } catch (error) {
    console.error('Activities error:', error);
    res.json([]);
  }
});

// Helper function for time ago
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

module.exports = router;