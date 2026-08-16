import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { UserPlusIcon, CheckIcon, BuildingOfficeIcon, AcademicCapIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const RightSidebar = () => {
  const { user } = useAuth();
  const [suggestedStudents, setSuggestedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState({});

  useEffect(() => {
    fetchSuggested();
  }, []);

  const fetchSuggested = async () => {
    try {
      const { data } = await api.get('/students');
      if (Array.isArray(data)) {
        // Filter out current user and already friends
        const filtered = data
          .filter(s => s._id !== user?._id)
          .slice(0, 4);
        setSuggestedStudents(filtered);
      }
    } catch (err) {
      console.error('Error fetching suggested students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (studentId) => {
    try {
      await api.post(`/friends/request/${studentId}`);
      setSentRequests(prev => ({ ...prev, [studentId]: true }));
    } catch (err) {
      console.error('Add friend error:', err);
    }
  };

  return (
    <aside aria-label="Campus Directory Sidebar" className="hidden lg:block w-80 space-y-5 select-none font-sans shrink-0">
      {/* Current User Quick Profile Card */}
      <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#262626] rounded-2xl p-4 shadow-sm transition-colors duration-200">
        <div className="flex items-center space-x-3">
          <Link to="/profile" className="shrink-0 group">
            <img
              src={user?.profileImage || 'https://via.placeholder.com/50'}
              alt={user?.name || 'User'}
              className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-md group-hover:scale-105 transition-transform"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }}
            />
          </Link>
          <div className="flex-1 min-w-0">
            <Link to="/profile" className="block text-sm font-bold text-gray-900 dark:text-white truncate hover:underline">
              {user?.name || 'Student User'}
            </Link>
            <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
              {user?.department ? `${user.department} • ${user.year || ''}` : user?.college || 'CampusLink Member'}
            </p>
          </div>
          <Link
            to="/profile"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            View
          </Link>
        </div>
      </div>

      {/* Suggested Students to Connect */}
      <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#262626] rounded-2xl p-4 shadow-sm transition-colors duration-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
            Suggested Peers
          </h3>
          <Link to="/search" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            See All
          </Link>
        </div>

        <div className="space-y-3">
          {suggestedStudents.length > 0 ? (
            suggestedStudents.map(student => (
              <div key={student._id} className="flex items-center justify-between space-x-2">
                <Link to={`/students/${student._id}`} className="flex items-center space-x-2.5 min-w-0 flex-1 group">
                  <img
                    src={student.profileImage || 'https://via.placeholder.com/40'}
                    alt={student.name}
                    className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-zinc-700 shrink-0 group-hover:scale-105 transition-transform"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {student.name}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">
                      {student.department || student.college || 'Student'}
                    </p>
                  </div>
                </Link>

                {sentRequests[student._id] ? (
                  <span className="px-2 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg flex items-center space-x-1 shrink-0">
                    <CheckIcon className="w-3 h-3" />
                    <span>Sent</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleAddFriend(student._id)}
                    className="p-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-lg transition-colors shrink-0"
                    title="Add Friend"
                  >
                    <UserPlusIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 dark:text-zinc-400 py-1 text-center">
              Explore your campus directory to connect with peers.
            </p>
          )}
        </div>
      </div>

      {/* Quick Links / Campus Information */}
      <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#262626] rounded-2xl p-4 shadow-sm transition-colors duration-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-3">
          Campus Network
        </h3>
        <div className="space-y-2 text-xs">
          <Link to="/communities" className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1A1A1A] text-gray-700 dark:text-zinc-300 transition-colors">
            <div className="flex items-center space-x-2">
              <BuildingOfficeIcon className="w-4 h-4 text-purple-500" />
              <span>Campus Clubs & Societies</span>
            </div>
            <ArrowRightIcon className="w-3.5 h-3.5 text-gray-400" />
          </Link>
          <Link to="/events" className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1A1A1A] text-gray-700 dark:text-zinc-300 transition-colors">
            <div className="flex items-center space-x-2">
              <AcademicCapIcon className="w-4 h-4 text-emerald-500" />
              <span>Upcoming Events & Hackathons</span>
            </div>
            <ArrowRightIcon className="w-3.5 h-3.5 text-gray-400" />
          </Link>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-400 dark:text-zinc-500 text-center">
          CampusLink © 2026 • Premium Student Network
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
