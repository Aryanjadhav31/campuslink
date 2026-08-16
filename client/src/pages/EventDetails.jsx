import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  UserGroupIcon,
  GlobeAltIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data);
      
      const participant = data.participants.some(p => p._id === user?._id);
      setIsParticipant(participant);
      setIsPast(new Date(data.date) < new Date());
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async () => {
    try {
      await api.post(`/events/${id}/rsvp`);
      toast.success('RSVP updated!');
      fetchEventDetails();
    } catch (error) {
      toast.error('Failed to update RSVP');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="py-12 text-center">
          <p className="text-gray-500">Event not found</p>
        </div>
      </Layout>
    );
  }

  const isFull = event.maxParticipants > 0 && event.participants.length >= event.maxParticipants;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/events')}
          className="flex items-center mb-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-1" />
          Back to Events
        </button>

        {/* Event Details */}
        <div className="overflow-hidden bg-white shadow-sm rounded-xl">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="object-cover w-full h-64"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-64 bg-gradient-to-r from-green-500 to-blue-500">
              <CalendarIcon className="w-24 h-24 text-white opacity-50" />
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{event.title}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-3 py-1 text-sm text-blue-800 bg-blue-100 rounded-full">
                    {event.category}
                  </span>
                  {event.isVirtual && (
                    <span className="px-3 py-1 text-sm text-purple-800 bg-purple-100 rounded-full">
                      Virtual
                    </span>
                  )}
                  {isPast && (
                    <span className="px-3 py-1 text-sm text-gray-800 bg-gray-100 rounded-full">
                      Past Event
                    </span>
                  )}
                </div>
              </div>
              
              {!isPast && (
                isParticipant ? (
                  <button
                    onClick={handleRSVP}
                    className="px-6 py-2 text-green-700 transition-colors bg-green-100 rounded-lg hover:bg-green-200"
                  >
                    Going
                  </button>
                ) : (
                  <button
                    onClick={handleRSVP}
                    disabled={isFull}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      isFull
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isFull ? 'Event Full' : 'RSVP Now'}
                  </button>
                )
              )}
            </div>
            
            {/* Event Info */}
            <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-2">
              <div className="flex items-center space-x-3 text-gray-600">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <span>
                  {new Date(event.date).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              <div className="flex items-center space-x-3 text-gray-600">
                {event.isVirtual ? (
                  <VideoCameraIcon className="w-5 h-5 text-purple-600" />
                ) : (
                  <MapPinIcon className="w-5 h-5 text-red-600" />
                )}
                <span>{event.isVirtual ? 'Virtual Event' : event.location}</span>
              </div>
              
              <div className="flex items-center space-x-3 text-gray-600">
                <UsersIcon className="w-5 h-5 text-green-600" />
                <span>
                  {event.participants.length} participants
                  {event.maxParticipants > 0 && ` (Max: ${event.maxParticipants})`}
                </span>
              </div>
              
              <div className="flex items-center space-x-3 text-gray-600">
                <UserGroupIcon className="w-5 h-5 text-purple-600" />
                <span>Organizer: {event.organizer.name}</span>
              </div>
            </div>
            
            {event.isVirtual && event.meetingLink && (
              <div className="p-4 mt-4 border border-blue-200 rounded-lg bg-blue-50">
                <p className="text-sm text-blue-800">
                  <strong>Meeting Link:</strong>{' '}
                  <a
                    href={event.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {event.meetingLink}
                  </a>
                </p>
              </div>
            )}
            
            {/* Description */}
            <div className="mt-6">
              <h3 className="mb-2 text-lg font-semibold">About This Event</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>
            
            {/* Participants */}
            <div className="mt-6">
              <h3 className="mb-3 text-lg font-semibold">Participants ({event.participants.length})</h3>
              <div className="flex flex-wrap gap-2">
                {event.participants.map((participant) => (
                  <Link
                    key={participant._id}
                    to={`/students/${participant._id}`}
                    className="flex items-center px-3 py-2 space-x-2 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <img
                      src={participant.profileImage || 'https://via.placeholder.com/32'}
                      alt={participant.name}
                      className="object-cover w-8 h-8 rounded-full"
                    />
                    <span className="text-sm font-medium">{participant.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetails;