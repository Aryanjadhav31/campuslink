const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxParticipants: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['Hackathon', 'Workshop', 'Seminar', 'Meetup', 'Sports', 'Cultural', 'Other'],
    default: 'Other'
  },
  isVirtual: {
    type: Boolean,
    default: false
  },
  meetingLink: {
    type: String
  },
  image: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);