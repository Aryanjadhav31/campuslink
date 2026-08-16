import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PhotoIcon, CalendarIcon, UserGroupIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

const CreatePostWidget = () => {
  const { user } = useAuth();

  return (
    <div className="w-full bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#262626] rounded-2xl p-4 mb-5 shadow-sm transition-colors duration-200">
      <div className="flex items-center space-x-3">
        <img
          src={user?.profileImage || 'https://via.placeholder.com/40'}
          alt={user?.name || 'Profile'}
          className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-zinc-700 shrink-0"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
        />
        <Link
          to="/create-post"
          className="flex-1 bg-gray-100 hover:bg-gray-200/80 dark:bg-[#1A1A1A] dark:hover:bg-[#222222] text-gray-500 dark:text-zinc-400 text-sm px-4 py-2.5 rounded-full transition-all duration-200 flex items-center justify-between cursor-pointer group"
        >
          <span className="truncate">What's happening on campus, {user?.name?.split(' ')[0] || 'student'}?</span>
          <PaperAirplaneIcon className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 dark:border-zinc-800/60 px-2">
        <Link
          to="/create-post"
          className="flex items-center space-x-2 text-xs font-semibold text-gray-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <PhotoIcon className="w-4 h-4 text-emerald-500" />
          <span>Photo / Video</span>
        </Link>

        <Link
          to="/events"
          className="flex items-center space-x-2 text-xs font-semibold text-gray-600 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          <CalendarIcon className="w-4 h-4 text-purple-500" />
          <span>Campus Event</span>
        </Link>

        <Link
          to="/communities"
          className="flex items-center space-x-2 text-xs font-semibold text-gray-600 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
        >
          <UserGroupIcon className="w-4 h-4 text-amber-500" />
          <span>Community</span>
        </Link>
      </div>
    </div>
  );
};

export default CreatePostWidget;
