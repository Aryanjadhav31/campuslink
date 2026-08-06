import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { Link, useSearchParams } from 'react-router-dom';
import { friends, students as studentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  XMarkIcon,
  SparklesIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { APPROVED_COLLEGES } from '../constants/colleges';

const Search = () => {
  const { user: currentUser, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialSearch = searchParams.get('search') || '';
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  
  const [filters, setFilters] = useState({
    college: '',
    department: '',
    year: ''
  });

  const [sortOption, setSortOption] = useState('name');
  const [showFilters, setShowFilters] = useState(true);

  const [filterOptions, setFilterOptions] = useState({
    colleges: [],
    departments: [],
    years: []
  });

  const [sentRequests, setSentRequests] = useState({});
  const [incomingRequests, setIncomingRequests] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchFilterOptions();
    fetchFriendRequests();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const { data } = await studentsApi.getFilterOptions();
      setFilterOptions({
        colleges: Array.isArray(data.colleges) ? data.colleges : [],
        departments: Array.isArray(data.departments) ? data.departments : [],
        years: Array.isArray(data.years) ? data.years : []
      });
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const { data } = await friends.getRequests({ type: 'all' });
      if (Array.isArray(data)) {
        const sent = {};
        const incoming = {};
        data.forEach(req => {
          if (req.status === 'pending') {
            const senderId = req.sender._id || req.sender;
            const receiverId = req.receiver._id || req.receiver;
            if (senderId === currentUser?._id) {
              sent[receiverId] = req._id;
            } else if (receiverId === currentUser?._id) {
              incoming[senderId] = req._id;
            }
          }
        });
        setSentRequests(sent);
        setIncomingRequests(incoming);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearch) {
      setSearchParams({ search: debouncedSearch });
    } else {
      setSearchParams({});
    }
  }, [debouncedSearch, setSearchParams]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (filters.college && filters.college !== 'All Colleges') params.college = filters.college;
      if (filters.department && filters.department !== 'All Departments') params.department = filters.department;
      if (filters.year && filters.year !== 'All Years') params.year = filters.year;
      if (sortOption) params.sort = sortOption;

      const { data } = await studentsApi.getAll(params);
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load student directory');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters, sortOption]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setFilters({ college: '', department: '', year: '' });
    setSortOption('name');
    setSearchParams({});
  };

  const handleAddFriend = async (studentId) => {
    setActionLoading(prev => ({ ...prev, [studentId]: true }));
    try {
      const { data } = await friends.sendRequest(studentId);
      setSentRequests(prev => ({ ...prev, [studentId]: data.friendRequest?._id || true }));
      toast.success('Connection request sent! 🚀');
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error(error.response?.data?.message || 'Failed to send connection request');
    } finally {
      setActionLoading(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const handleAcceptFriend = async (studentId) => {
    const requestId = incomingRequests[studentId] || studentId;
    setActionLoading(prev => ({ ...prev, [studentId]: true }));
    try {
      await friends.acceptRequest(requestId);
      toast.success('Connection accepted! 🎉');
      setIncomingRequests(prev => {
        const copy = { ...prev };
        delete copy[studentId];
        return copy;
      });
      fetchStudents();
      if (updateUser) {
        const updatedFriends = [...(currentUser?.friends || []), studentId];
        updateUser({ friends: updatedFriends });
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error(error.response?.data?.message || 'Failed to accept connection request');
    } finally {
      setActionLoading(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const handleRejectFriend = async (studentId) => {
    const requestId = incomingRequests[studentId] || studentId;
    setActionLoading(prev => ({ ...prev, [studentId]: true }));
    try {
      await friends.rejectRequest(requestId);
      toast.success('Connection request rejected');
      setIncomingRequests(prev => {
        const copy = { ...prev };
        delete copy[studentId];
        return copy;
      });
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error(error.response?.data?.message || 'Failed to reject connection request');
    } finally {
      setActionLoading(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const studentsArray = Array.isArray(students) ? students : [];
  const hasActiveFilters = searchTerm || filters.college || filters.department || filters.year || sortOption !== 'name';

  return (
    <Layout activeTab="search">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center">
              <MagnifyingGlassIcon className="w-8 h-8 mr-2.5 text-[#0095F6]" />
              Student Search
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Discover and connect with verified students across supported engineering colleges
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="px-4 py-1.5 bg-blue-50 dark:bg-[#1A1A1A] border border-blue-200 dark:border-[#262626] text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-bold rounded-full flex items-center shadow-sm">
              <SparklesIcon className="w-4 h-4 mr-1.5 text-blue-500 animate-pulse" />
              {studentsArray.length} {studentsArray.length === 1 ? 'Student' : 'Students'} Found
            </span>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 space-x-2 text-xs sm:text-sm font-semibold transition-all bg-gray-100 dark:bg-[#161616] border border-gray-200 dark:border-[#242424] text-gray-700 dark:text-zinc-300 rounded-xl hover:bg-gray-200 dark:hover:bg-[#262626] cursor-pointer"
            >
              <FunnelIcon className="w-4 h-4" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
          </div>
        </div>

        {/* Controls Box */}
        <div className="p-4 sm:p-5 mb-8 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] shadow-sm rounded-2xl space-y-4">
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name, username, college, department..."
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
            
            <div className="sm:w-56">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full h-[46px] px-3 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-900 dark:text-white text-xs font-semibold rounded-xl focus:border-[#0095F6] outline-none cursor-pointer"
              >
                <option value="name">Name (A–Z)</option>
                <option value="name_desc">Name (Z–A)</option>
                <option value="newest">Recently Joined</option>
                <option value="active">Most Active</option>
              </select>
            </div>
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
                    <option key={c} value={c}>
                      {c}
                    </option>
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
                  {filterOptions.departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
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
                    <XMarkIcon className="w-3.5 h-3.5 mr-1" /> Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-blue-200 dark:border-zinc-700 rounded-full" />
              <div className="absolute inset-0 border-t-4 border-blue-600 rounded-full animate-spin" />
            </div>
            <p className="mt-4 text-xs font-medium text-gray-500 dark:text-zinc-400 animate-pulse">
              Searching students...
            </p>
          </div>
        ) : studentsArray.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] shadow-sm rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-[#161616] text-gray-400 dark:text-zinc-500 rounded-full flex items-center justify-center">
              <MagnifyingGlassIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No students found</h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              No students found matching your selected filters. Try changing the college, department, academic year, or search query.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-5 inline-flex items-center px-5 py-2.5 bg-[#0095F6] hover:bg-[#0081D6] text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" /> Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentsArray.map((student) => {
              const isFriend = currentUser?.friends?.some(f => (f._id || f) === student._id) || student.friends?.some(f => (f._id || f) === currentUser?._id);
              const isRequestSent = sentRequests[student._id];
              const isIncomingRequest = incomingRequests[student._id];
              const isLoading = actionLoading[student._id];

              return (
                <div
                  key={student._id}
                  className="p-5 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] hover:border-gray-300 dark:hover:border-[#2D2D2D] text-gray-900 dark:text-white shadow-sm hover:shadow-xl rounded-2xl transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    
                    <div className="flex items-start space-x-3.5 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={student.profileImage || 'https://via.placeholder.com/60'}
                          alt={student.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 dark:border-[#262626] group-hover:scale-105 transition-transform"
                          onError={(e) => e.target.src = 'https://via.placeholder.com/60'}
                        />
                        {student.isVerified !== false && (
                          <span className="absolute bottom-0 right-0 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white ring-2 ring-white dark:ring-[#111111] text-[10px] font-bold" title="Verified Student">
                            ✓
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <Link
                            to={`/students/${student._id}`}
                            className="font-bold text-sm text-gray-900 dark:text-white hover:text-[#0095F6] transition-colors truncate"
                          >
                            {student.name || 'Student'}
                          </Link>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                          @{student.username || student.name?.toLowerCase().replace(/\s+/g, '_') || 'student'}
                        </p>

                        <div className="mt-1 inline-flex items-center px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-md">
                          {student.year || '1st Year'}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600 dark:text-zinc-400">
                      <p className="font-semibold text-gray-900 dark:text-zinc-200 truncate flex items-center">
                        <BuildingLibraryIcon className="w-3.5 h-3.5 mr-1.5 text-gray-400 shrink-0" />
                        {student.college || 'Campus Student'}
                      </p>
                      <p className="truncate flex items-center text-gray-500 dark:text-zinc-400">
                        <AcademicCapIcon className="w-3.5 h-3.5 mr-1.5 text-gray-400 shrink-0" />
                        {student.department || 'General Studies'}
                      </p>
                    </div>

                    {student.bio && (
                      <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed italic bg-gray-50 dark:bg-[#161616] p-2 rounded-lg">
                        "{student.bio}"
                      </p>
                    )}

                    {student.skills && student.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {student.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-900/30 rounded-md truncate max-w-[110px]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 dark:border-[#1F1F1F] flex items-center justify-between gap-2">
                    <Link
                      to={`/students/${student._id}`}
                      className="flex-1 py-2 px-3 text-center text-xs font-semibold text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-[#181818] hover:bg-gray-200 dark:hover:bg-[#242424] rounded-xl transition-colors cursor-pointer"
                    >
                      View Profile
                    </Link>

                    {isFriend ? (
                      <button
                        disabled
                        className="py-2 px-3 bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center justify-center shrink-0 cursor-default border border-emerald-500/20 opacity-80"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-1 text-emerald-500" /> Friends
                      </button>
                    ) : isRequestSent ? (
                      <button
                        disabled
                        className="py-2 px-3 bg-gray-100 dark:bg-[#262626] text-gray-500 dark:text-zinc-400 text-xs font-semibold rounded-xl flex items-center shrink-0 cursor-default border border-gray-200 dark:border-[#333] opacity-80"
                      >
                        <ClockIcon className="w-4 h-4 mr-1 text-amber-500" /> Pending
                      </button>
                    ) : isIncomingRequest ? (
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          onClick={() => handleAcceptFriend(student._id)}
                          disabled={isLoading}
                          className="py-2 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircleIcon className="w-4 h-4 mr-1" /> Accept
                        </button>
                        <button
                          onClick={() => handleRejectFriend(student._id)}
                          disabled={isLoading}
                          className="py-2 px-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center cursor-pointer disabled:opacity-50"
                        >
                          <XCircleIcon className="w-4 h-4 mr-1" /> Reject
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddFriend(student._id)}
                        disabled={isLoading}
                        className="py-2 px-3 bg-[#0095F6] hover:bg-[#0081D6] text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                        ) : (
                          <UserPlusIcon className="w-4 h-4 mr-1" />
                        )}
                        <span>{isLoading ? 'Sending...' : 'Connect'}</span>
                      </button>
                    )}
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

export default Search;
