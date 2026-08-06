import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { friends } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  UserGroupIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  TrashIcon,
  XMarkIcon,
  ArrowPathIcon,
  UserPlusIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { APPROVED_COLLEGES } from '../constants/colleges';

const Friends = () => {
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  
  const [friendsList, setFriendsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  const [filters, setFilters] = useState({
    college: '',
    department: '',
    year: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const { data } = await friends.getFriends();
      const list = Array.isArray(data) ? data : [];
      setFriendsList(list);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to load your friends list');
      setFriendsList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId, friendName) => {
    if (!window.confirm(`Are you sure you want to remove ${friendName} from your friends?`)) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [friendId]: true }));
    try {
      await friends.removeFriend(friendId);
      toast.success(`Removed ${friendName} from friends`);
      const updated = friendsList.filter(f => f._id !== friendId);
      setFriendsList(updated);
      if (updateUser) {
        updateUser({ friends: updated.map(f => f._id) });
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error(error.response?.data?.message || 'Failed to remove friend');
    } finally {
      setActionLoading(prev => ({ ...prev, [friendId]: false }));
    }
  };

  // Extract distinct departments & years from current friends list for exact filtering
  const departments = useMemo(() => {
    const deps = new Set(friendsList.map(f => f.department).filter(Boolean));
    return Array.from(deps).sort();
  }, [friendsList]);

  // Client-side filtering inside existing friends list ONLY
  const filteredFriends = useMemo(() => {
    return friendsList.filter(friend => {
      // 1. Search Query (Name, Username, Bio, Email)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const nameMatch = friend.name?.toLowerCase().includes(query);
        const usernameMatch = friend.username?.toLowerCase().includes(query);
        const bioMatch = friend.bio?.toLowerCase().includes(query);
        const emailMatch = friend.email?.toLowerCase().includes(query);
        if (!nameMatch && !usernameMatch && !bioMatch && !emailMatch) return false;
      }

      // 2. College Filter
      if (filters.college && friend.college !== filters.college) return false;

      // 3. Department Filter
      if (filters.department && friend.department !== filters.department) return false;

      // 4. Academic Year Filter
      if (filters.year && friend.year !== filters.year) return false;

      return true;
    });
  }, [friendsList, searchTerm, filters]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({ college: '', department: '', year: '' });
  };

  const hasActiveFilters = searchTerm || filters.college || filters.department || filters.year;

  return (
    <Layout activeTab="friends">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center">
              <UserGroupIcon className="w-8 h-8 mr-2.5 text-[#0095F6]" />
              My Friends
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              View and manage your connected campus connections
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold rounded-full flex items-center shadow-sm">
              {filteredFriends.length} {filteredFriends.length === 1 ? 'Connection' : 'Connections'}
            </span>

            {friendsList.length > 0 && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 space-x-2 text-xs sm:text-sm font-semibold transition-all bg-gray-100 dark:bg-[#161616] border border-gray-200 dark:border-[#242424] text-gray-700 dark:text-zinc-300 rounded-xl hover:bg-gray-200 dark:hover:bg-[#262626] cursor-pointer"
              >
                <FunnelIcon className="w-4 h-4" />
                <span>{showFilters ? 'Hide Filters' : 'Filter Friends'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Controls Box (Search inside friends list) */}
        {friendsList.length > 0 && (
          <div className="p-4 sm:p-5 mb-8 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] shadow-sm rounded-2xl space-y-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search within your friends list..."
                className="w-full h-[46px] pl-11 pr-10 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] hover:border-gray-400 dark:hover:border-[#383838] focus:border-[#0095F6] focus:ring-2 focus:ring-[#0095F6]/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 rounded-xl text-xs sm:text-sm outline-none transition-all"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {showFilters && (
              <div className="pt-4 border-t border-gray-200 dark:border-[#1F1F1F] grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center">
                    <BuildingLibraryIcon className="w-3.5 h-3.5 mr-1 text-blue-500" /> College
                  </label>
                  <select
                    value={filters.college}
                    onChange={(e) => setFilters({ ...filters, college: e.target.value })}
                    className="w-full h-[42px] px-3 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-900 dark:text-white text-xs rounded-xl focus:border-[#0095F6] outline-none cursor-pointer"
                  >
                    <option value="">All Colleges</option>
                    {APPROVED_COLLEGES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center">
                    <AcademicCapIcon className="w-3.5 h-3.5 mr-1 text-blue-500" /> Department
                  </label>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    className="w-full h-[42px] px-3 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-900 dark:text-white text-xs rounded-xl focus:border-[#0095F6] outline-none cursor-pointer"
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Academic Year
                  </label>
                  <select
                    value={filters.year}
                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                    className="w-full h-[42px] px-3 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-900 dark:text-white text-xs rounded-xl focus:border-[#0095F6] outline-none cursor-pointer"
                  >
                    <option value="">All Years</option>
                    <option value="First Year">First Year</option>
                    <option value="Second Year">Second Year</option>
                    <option value="Third Year">Third Year</option>
                    <option value="Final Year">Final Year</option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <div className="sm:col-span-3 flex justify-end pt-1">
                    <button
                      onClick={handleClearFilters}
                      className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center cursor-pointer hover:underline"
                    >
                      <XMarkIcon className="w-3.5 h-3.5 mr-1" /> Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-blue-200 dark:border-zinc-700 rounded-full" />
              <div className="absolute inset-0 border-t-4 border-blue-600 rounded-full animate-spin" />
            </div>
            <p className="mt-4 text-xs font-medium text-gray-500 dark:text-zinc-400 animate-pulse">
              Loading your friends...
            </p>
          </div>
        ) : friendsList.length === 0 ? (
          /* Empty Friends State */
          <div className="p-12 text-center bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] shadow-sm rounded-2xl">
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-50 dark:bg-blue-900/20 text-[#0095F6] rounded-full flex items-center justify-center">
              <UserGroupIcon className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">You don't have any friends yet</h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              Search students across supported colleges and send connection requests to build your campus network.
            </p>
            <button
              onClick={() => navigate('/search')}
              className="mt-6 inline-flex items-center px-6 py-3 bg-[#0095F6] hover:bg-[#0081D6] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer space-x-2"
            >
              <UserPlusIcon className="w-5 h-5" />
              <span>Find Students</span>
            </button>
          </div>
        ) : filteredFriends.length === 0 ? (
          /* Empty Search Result in Friends */
          <div className="p-10 text-center bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] shadow-sm rounded-2xl">
            <div className="w-14 h-14 mx-auto mb-3 bg-gray-100 dark:bg-[#161616] text-gray-400 dark:text-zinc-500 rounded-full flex items-center justify-center">
              <MagnifyingGlassIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No matching friends found</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
              None of your friends match the active search or filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-4 inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-[#1E1E1E] hover:bg-gray-200 dark:hover:bg-[#282828] text-gray-700 dark:text-zinc-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              <ArrowPathIcon className="w-4 h-4 mr-1.5" /> Clear Filters
            </button>
          </div>
        ) : (
          /* Friends Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFriends.map((friend) => {
              const isRemoving = actionLoading[friend._id];

              return (
                <div
                  key={friend._id}
                  className="p-5 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] hover:border-gray-300 dark:hover:border-[#2D2D2D] text-gray-900 dark:text-white shadow-sm hover:shadow-xl rounded-2xl transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    
                    <div className="flex items-start space-x-3.5 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={friend.profileImage || 'https://via.placeholder.com/60'}
                          alt={friend.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/40 group-hover:scale-105 transition-transform"
                          onError={(e) => e.target.src = 'https://via.placeholder.com/60'}
                        />
                        {friend.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#111111]" title="Online Now" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/students/${friend._id}`}
                          className="font-bold text-sm text-gray-900 dark:text-white hover:text-[#0095F6] transition-colors truncate block"
                        >
                          {friend.name || 'Friend'}
                        </Link>

                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                          @{friend.username || friend.name?.toLowerCase().replace(/\s+/g, '_') || 'student'}
                        </p>

                        <div className="mt-1 inline-flex items-center px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-md">
                          Connected
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600 dark:text-zinc-400">
                      <p className="font-semibold text-gray-900 dark:text-zinc-200 truncate flex items-center">
                        <BuildingLibraryIcon className="w-3.5 h-3.5 mr-1.5 text-gray-400 shrink-0" />
                        {friend.college || 'Campus Student'}
                      </p>
                      <p className="truncate flex items-center text-gray-500 dark:text-zinc-400">
                        <AcademicCapIcon className="w-3.5 h-3.5 mr-1.5 text-gray-400 shrink-0" />
                        {friend.department || 'General Studies'} • {friend.year || 'Student'}
                      </p>
                    </div>

                    {friend.bio && (
                      <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed italic bg-gray-50 dark:bg-[#161616] p-2 rounded-lg">
                        "{friend.bio}"
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 dark:border-[#1F1F1F] flex items-center justify-between gap-2">
                    <Link
                      to={`/students/${friend._id}`}
                      className="flex-1 py-2 px-3 text-center text-xs font-semibold text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-[#181818] hover:bg-gray-200 dark:hover:bg-[#242424] rounded-xl transition-colors cursor-pointer"
                    >
                      View Profile
                    </Link>

                    <button
                      onClick={() => handleRemoveFriend(friend._id, friend.name)}
                      disabled={isRemoving}
                      className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
                      title="Remove Friend"
                    >
                      {isRemoving ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <TrashIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </Layout>
  );
};

export default Friends;
