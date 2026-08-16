import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon,
  ClockIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/dashboard/upcoming-events');
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntil = (date) => {
    const now = new Date();
    const eventDate = new Date(date);
    const diffTime = eventDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (date) => {
    const days = getDaysUntil(date);
    if (days === 0) {
      return { text: 'Live Now', className: 'bg-red-500/10 text-red-600 border border-red-200' };
    }
    if (days === 1) {
      return { text: 'Tomorrow', className: 'bg-orange-500/10 text-orange-600 border border-orange-200' };
    }
    if (days <= 7) {
      return { text: `${days} days left`, className: 'bg-blue-500/10 text-blue-600 border border-blue-200' };
    }
    return { text: `${days} days`, className: 'bg-gray-500/10 text-gray-500 border border-gray-200' };
  };

  if (loading) {
    return (
      <div className="p-6 bg-white border border-gray-100 shadow-2xl rounded-3xl">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-100 shadow-2xl rounded-3xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
          <p className="flex items-center text-sm text-green-600">
            <span className="w-2 h-2 mr-2 bg-green-500 rounded-full animate-pulse"></span>
            {events.length} events scheduled
          </p>
        </div>
        <Link to="/events" className="flex items-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">
          View All
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="py-12 text-center">
          <div className="flex justify-center mb-3">
            <CalendarIcon className="w-16 h-16 text-gray-300" />
          </div>
          <p className="font-medium text-gray-500">No upcoming events</p>
          <p className="mt-1 text-sm text-gray-400">New events will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
          {events.map((event) => {
            const status = getStatusBadge(event.date);
            return (
              <div key={event.id || event._id} className="p-4 transition-all bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-md group">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1.5">
                      <h4 className="font-semibold text-gray-900 truncate">{event.title}</h4>
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${status.className}`}>
                        {status.text}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center">
                        <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="flex items-center">
                        <MapPinIcon className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                        {event.isVirtual ? 'Virtual' : event.location || 'TBD'}
                      </span>
                      <span className="flex items-center">
                        <UsersIcon className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                        {event.participants || 0}/{event.maxParticipants || '∞'}
                      </span>
                    </div>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                        {event.category || 'General'}
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-500">Organized by {event.organizer || 'Unknown'}</span>
                    </div>
                  </div>
                  <Link
                    to={`/events/${event.id || event._id}`}
                    className="px-4 py-2 ml-3 text-sm font-medium text-white transition-all bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-lg hover:scale-105 shadow-blue-500/25 whitespace-nowrap"
                  >
                    Register
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {events.length > 0 && (
        <div className="pt-4 mt-4 text-xs text-center text-gray-400 border-t border-gray-100">
          {events.filter(e => getDaysUntil(e.date) === 0).length} events happening today
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;