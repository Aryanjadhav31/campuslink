import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: 'Other',
    maxParticipants: '',
    isVirtual: false,
    meetingLink: ''
  });

  const categories = [
    'Hackathon', 'Workshop', 'Seminar', 'Meetup', 
    'Sports', 'Cultural', 'Other'
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get('/api/events');
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/events', formData);
      setEvents(prev => [data, ...prev]);
      toast.success('Event created successfully!');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        date: '',
        location: '',
        category: 'Other',
        maxParticipants: '',
        isVirtual: false,
        meetingLink: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    }
  };

  const handleRSVP = async (eventId) => {
    try {
      await axios.post(`/api/events/${eventId}/rsvp`);
      toast.success('RSVP updated!');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to update RSVP');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? event.category === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-start justify-between mb-6 sm:flex-row sm:items-center">
          <h2 className="text-2xl font-bold">Events</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 mt-2 text-white transition-colors bg-blue-600 rounded-lg sm:mt-0 hover:bg-blue-700"
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            Create Event
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-4 mb-6 bg-white shadow-sm rounded-xl">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search events..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-8 text-center bg-white shadow-sm rounded-xl">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg text-gray-500">No events found</p>
            <p className="text-sm text-gray-400">Create your own event or check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const isParticipant = event.participants.some(p => p._id === user?._id);
              const isFull = event.maxParticipants > 0 && 
                            event.participants.length >= event.maxParticipants;
              const isPast = new Date(event.date) < new Date();
              
              return (
                <div
                  key={event._id}
                  className="overflow-hidden transition-shadow bg-white shadow-sm rounded-xl hover:shadow-md"
                >
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="object-cover w-full h-48"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-48 bg-gradient-to-r from-green-500 to-blue-500">
                      <CalendarIcon className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                        <span className="text-sm text-gray-500">{event.category}</span>
                      </div>
                      {event.isVirtual && (
                        <span className="px-2 py-1 text-xs text-purple-800 bg-purple-100 rounded-full">
                          Virtual
                        </span>
                      )}
                    </div>
                    
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="mt-3 space-y-1 text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {new Date(event.date).toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-2" />
                        {event.isVirtual ? 'Virtual Event' : event.location}
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="w-4 h-4 mr-2" />
                        {event.participants.length} participants
                        {event.maxParticipants > 0 && ` / ${event.maxParticipants}`}
                      </div>
                    </div>
                    
                    <div className="flex mt-4 space-x-2">
                      <Link
                        to={`/events/${event._id}`}
                        className="flex-1 px-4 py-2 text-sm text-center text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Details
                      </Link>
                      
                      {!isPast && (
                        isParticipant ? (
                          <button
                            onClick={() => handleRSVP(event._id)}
                            className="flex-1 px-4 py-2 text-sm text-green-700 transition-colors bg-green-100 rounded-lg hover:bg-green-200"
                          >
                            Going
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRSVP(event._id)}
                            disabled={isFull}
                            className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm ${
                              isFull
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {isFull ? 'Full' : 'RSVP'}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Event Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black bg-opacity-50">
            <div className="w-full max-w-lg p-6 my-8 bg-white shadow-xl rounded-xl">
              <h3 className="mb-4 text-xl font-bold">Create Event</h3>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Physical location or venue"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Max Participants (0 for unlimited)
                  </label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isVirtual}
                      onChange={(e) => setFormData({ ...formData, isVirtual: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Virtual Event</span>
                  </label>
                </div>
                
                {formData.isVirtual && (
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      value={formData.meetingLink}
                      onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                )}
                
                <div className="flex pt-2 space-x-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Create Event
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Events;