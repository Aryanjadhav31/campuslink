const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createEvent,
  getEvents,
  getEventById,
  rsvpEvent
} = require('../controllers/eventController');

router.post('/', protect, createEvent);
router.get('/', protect, getEvents);
router.get('/:id', protect, getEventById);
router.post('/:id/rsvp', protect, rsvpEvent);

module.exports = router;