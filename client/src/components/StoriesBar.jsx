import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { PlusIcon, SparklesIcon, UserGroupIcon, CalendarIcon } from '@heroicons/react/24/solid';

const StoriesBar = () => {
  const { user } = useAuth();
  const [moments, setMoments] = useState([]);

  useEffect(() => {
    fetchCampusMoments();
  }, []);

  const fetchCampusMoments = async () => {
    try {
      const [eventsRes, clubsRes] = await Promise.allSettled([
        api.get('/dashboard/upcoming-events'),
        api.get('/dashboard/top-clubs')
      ]);

      const items = [];

      if (eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value.data)) {
        eventsRes.value.data.slice(0, 4).forEach(evt => {
          items.push({
            id: `evt-${evt._id}`,
            name: evt.title,
            type: 'event',
            link: `/events/${evt._id}`,
            image: evt.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=150&auto=format&fit=crop&q=80',
            badge: 'Event'
          });
        });
      }

      if (clubsRes.status === 'fulfilled' && Array.isArray(clubsRes.value.data)) {
        clubsRes.value.data.slice(0, 4).forEach(club => {
          items.push({
            id: `club-${club._id}`,
            name: club.name,
            type: 'community',
            link: `/communities/${club._id}`,
            image: club.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
            badge: 'Club'
          });
        });
      }

      setMoments(items);
    } catch (err) {
      console.error('Error fetching campus moments:', err);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#262626] rounded-2xl p-3 mb-4 shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center space-x-1.5">
          <SparklesIcon className="w-4 h-4 text-blue-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
            Campus Moments
          </span>
        </div>
        <span className="text-[11px] font-medium text-gray-400 dark:text-zinc-500">
          Live Updates
        </span>
      </div>

      <div className="flex items-center space-x-3.5 overflow-x-auto pb-1 scrollbar-none snap-x touch-pan-x">
        {/* Your Story / Add Story Circle */}
        <Link
          to="/create-post"
          className="flex flex-col items-center shrink-0 space-y-1.5 group cursor-pointer"
        >
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 group-hover:scale-105 transition-transform duration-200">
            <img
              src={user?.profileImage || 'https://via.placeholder.com/60'}
              alt={user?.name || 'Your Story'}
              className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#121212]"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/60'; }}
            />
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-[#121212] shadow-md">
              <PlusIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[11px] font-semibold text-gray-800 dark:text-zinc-200 truncate w-16 text-center">
            Your Post
          </span>
        </Link>

        {/* Dynamic Campus Moments Circles */}
        {moments.map((item) => (
          <Link
            key={item.id}
            to={item.link}
            className="flex flex-col items-center shrink-0 space-y-1.5 group cursor-pointer snap-start"
          >
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 group-hover:scale-105 transition-transform duration-200 shadow-sm">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#121212]"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/60'; }}
              />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-zinc-900/90 text-white text-[9px] font-bold rounded-full border border-white/20 truncate max-w-[52px]">
                {item.badge}
              </div>
            </div>
            <span className="text-[11px] font-medium text-gray-700 dark:text-zinc-300 truncate w-16 text-center">
              {item.name}
            </span>
          </Link>
        ))}

        {/* Explore Communities Link */}
        <Link
          to="/communities"
          className="flex flex-col items-center shrink-0 space-y-1.5 group cursor-pointer"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-gray-300 dark:border-zinc-700 flex items-center justify-center group-hover:border-blue-500 dark:group-hover:border-blue-500 group-hover:scale-105 transition-all duration-200">
            <UserGroupIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <span className="text-[11px] font-medium text-gray-500 dark:text-zinc-400 truncate w-16 text-center">
            Clubs
          </span>
        </Link>
      </div>
    </div>
  );
};

export default StoriesBar;
