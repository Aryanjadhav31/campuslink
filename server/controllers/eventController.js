const Event = require('../models/Event');
const Notification = require('../models/Notification');

// @desc    Create event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, category, maxParticipants, isVirtual, meetingLink } = req.body;
    
    const event = await Event.create({
      title,
      description,
      date,
      location,
      category,
      maxParticipants,
      isVirtual,
      meetingLink,
      organizer: req.user._id
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    const { category, upcoming } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (upcoming) query.date = { $gte: new Date() };

    const events = await Event.find(query)
      .populate('organizer', 'name profileImage')
      .populate('participants', 'name profileImage')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name profileImage')
      .populate('participants', 'name profileImage');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    RSVP to event
// @route   POST /api/events/:id/rsvp
// @access  Private
const rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const isParticipant = event.participants.includes(req.user._id);
    
    if (isParticipant) {
      event.participants = event.participants.filter(id => id.toString() !== req.user._id.toString());
      await event.save();
      res.json({ message: 'RSVP cancelled' });
    } else {
      if (event.maxParticipants > 0 && event.participants.length >= event.maxParticipants) {
        return res.status(400).json({ message: 'Event is full' });
      }
      
      event.participants.push(req.user._id);
      await event.save();

      // Create notification for organizer
      if (event.organizer.toString() !== req.user._id.toString()) {
        await Notification.create({
          user: event.organizer,
          type: 'event_reminder',
          message: `${req.user.name} RSVPed to your event: ${event.title}`,
          from: req.user._id,
          link: `/event/${event._id}`
        });
      }

      res.json({ message: 'RSVP successful' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  rsvpEvent
};