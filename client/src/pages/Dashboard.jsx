import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  UserPlusIcon, 
  CalendarIcon, 
  UserGroupIcon,
  PlusCircleIcon,
  BellIcon,
  ChatBubbleLeftIcon,
  SparklesIcon,
  FireIcon,
  UserIcon,
  ArrowPathIcon,
  HeartIcon,
  BookmarkIcon,
  ShareIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  FaGithub, 
  FaLinkedin, 
  FaTwitter,
  FaInstagram 
} from 'react-icons/fa';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { onlineUsers } = useSocket();
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('for-you');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const feedRef = useRef(null);
  const [greeting, setGreeting] = useState('');

  // Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning ☀️');
    else if (hour < 17) setGreeting('Good Afternoon 🌤️');
    else if (hour < 21) setGreeting('Good Evening 🌅');
    else setGreeting('Good Night 🌙');
  }, []);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Fetching dashboard data...');
      
      try {
        const postsRes = await axios.get('http://localhost:5000/api/posts');
        console.log('📝 Posts response:', postsRes.data);
        setPosts(Array.isArray(postsRes.data.posts) ? postsRes.data.posts : []);
      } catch (postError) {
        console.error('❌ Posts error:', postError);
        setPosts([]);
      }
      
      try {
        const suggestionsRes = await axios.get('http://localhost:5000/api/users/suggestions');
        console.log('👥 Suggestions response:', suggestionsRes.data);
        const suggestionsData = suggestionsRes.data;
        setSuggestions(Array.isArray(suggestionsData) ? suggestionsData : []);
      } catch (suggestionError) {
        console.error('❌ Suggestions error:', suggestionError);
        setSuggestions([]);
      }
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  // Get online friends count
  const onlineFriendsCount = user?.friends?.filter(f => 
    onlineUsers?.includes(f._id)
  ).length || 0;

  // Get unread notifications count (placeholder)
  const unreadNotifications = 3;

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-t-4 border-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md p-8 text-center bg-white shadow-xl rounded-2xl">
            <div className="mb-4 text-5xl">😅</div>
            <h3 className="text-xl font-semibold text-gray-800">Oops! Something went wrong</h3>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <button 
              onClick={() => fetchDashboardData()}
              className="inline-flex items-center px-6 py-2.5 mt-4 text-white transition-all bg-blue-600 rounded-xl hover:bg-blue-700 hover:scale-105"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md p-8 text-center bg-white shadow-xl rounded-2xl">
            <div className="mb-4 text-5xl">👋</div>
            <h3 className="text-xl font-semibold text-gray-800">Welcome Back!</h3>
            <p className="mt-2 text-sm text-gray-500">Please login to view your dashboard</p>
            <Link 
              to="/login"
              className="inline-block px-6 py-2.5 mt-4 text-white transition-all bg-blue-600 rounded-xl hover:bg-blue-700 hover:scale-105"
            >
              Login Now
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const suggestionsArray = Array.isArray(suggestions) ? suggestions : [];
  const postsArray = Array.isArray(posts) ? posts : [];

  return (
    <Layout className="bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* 🌟 Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={user?.profileImage || 'https://via.placeholder.com/64'}
                  alt={user?.name}
                  className="object-cover w-16 h-16 border-2 border-white rounded-full shadow-lg ring-2 ring-blue-500/20"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/64'}
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                  {greeting}, {user?.name?.split(' ')[0] || 'User'}! 👋
                </h1>
                <p className="text-sm text-gray-500">
                  {user?.college || 'College'} · {user?.department || 'Department'} · {user?.year || 'Year'} Year
                </p>
              </div>
            </div>
            
            <div className="flex items-center mt-4 space-x-3 md:mt-0">
              {/* Quick Stats Badges */}
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-white rounded-full shadow-sm">
                <UserGroupIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">{user?.friends?.length || 0}</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-white rounded-full shadow-sm">
                <div className="relative">
                  <BellIcon className="w-4 h-4 text-purple-600" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </div>
              </div>
              <Link 
                to="/messages"
                className="flex items-center px-4 py-2 space-x-2 text-sm font-medium text-white transition-all rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
              >
                <ChatBubbleLeftIcon className="w-4 h-4" />
                <span>Chat</span>
                {onlineFriendsCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white/20 rounded-full">
                    {onlineFriendsCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3 mt-6 md:grid-cols-4">
            <div className="p-4 transition-all bg-white shadow-sm hover:shadow-md rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Friends</p>
                  <p className="text-2xl font-bold text-gray-800">{user?.friends?.length || 0}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-xl">
                  <UserGroupIcon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-xs text-green-600">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                {onlineFriendsCount} online now
              </div>
            </div>
            <div className="p-4 transition-all bg-white shadow-sm hover:shadow-md rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Posts</p>
                  <p className="text-2xl font-bold text-gray-800">{postsArray.length}</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-xl">
                  <FireIcon className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="p-4 transition-all bg-white shadow-sm hover:shadow-md rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Events</p>
                  <p className="text-2xl font-bold text-gray-800">0</p>
                </div>
                <div className="p-2 bg-green-50 rounded-xl">
                  <CalendarIcon className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
            <div className="p-4 transition-all bg-white shadow-sm hover:shadow-md rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Communities</p>
                  <p className="text-2xl font-bold text-gray-800">0</p>
                </div>
                <div className="p-2 bg-orange-50 rounded-xl">
                  <UserGroupIcon className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* 🔥 Main Feed - 8 columns */}
          <div className="lg:col-span-8">
            {/* Feed Tabs */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex p-1 space-x-1 bg-white shadow-sm rounded-xl">
                <button
                  onClick={() => setActiveTab('for-you')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'for-you'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <SparklesIcon className="inline w-4 h-4 mr-1.5" />
                  For You
                </button>
                <button
                  onClick={() => setActiveTab('latest')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'latest'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ClockIcon className="inline w-4 h-4 mr-1.5" />
                  Latest
                </button>
                <button
                  onClick={() => setActiveTab('trending')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'trending'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FireIcon className="inline w-4 h-4 mr-1.5" />
                  Trending
                </button>
              </div>
              
              <Link 
                to="/create-post"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-all shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
              >
                <PlusCircleIcon className="w-4 h-4 mr-1.5" />
                New Post
              </Link>
            </div>
            
            {/* Posts Feed */}
            {postsArray.length === 0 ? (
              <div className="p-12 text-center bg-white shadow-sm rounded-2xl">
                <div className="inline-flex p-4 mb-4 bg-gray-100 rounded-full">
                  <span className="text-4xl">📝</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">No posts yet</h3>
                <p className="mt-1 text-sm text-gray-500">Connect with more students to see their posts</p>
                <div className="flex flex-col items-center justify-center gap-3 mt-4 sm:flex-row">
                  <Link 
                    to="/students" 
                    className="inline-flex items-center px-6 py-2.5 text-white transition-all bg-blue-600 rounded-xl hover:bg-blue-700 hover:scale-105"
                  >
                    <UserPlusIcon className="w-4 h-4 mr-2" />
                    Find Students
                  </Link>
                  <Link 
                    to="/create-post"
                    className="inline-flex items-center px-6 py-2.5 text-gray-700 transition-all bg-gray-100 rounded-xl hover:bg-gray-200 hover:scale-105"
                  >
                    <PlusCircleIcon className="w-4 h-4 mr-2" />
                    Create Post
                  </Link>
                </div>
              </div>
            ) : (
              <div ref={feedRef} className="space-y-4">
                {postsArray.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* 📌 Right Sidebar - 4 columns */}
          <div className="lg:col-span-4">
            <div className="space-y-6">
              {/* 🎯 Profile Card - Enhanced */}
              <div className="overflow-hidden bg-white shadow-sm rounded-2xl">
                <div className="relative h-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                  <div className="absolute transform -translate-x-1/2 -bottom-10 left-1/2">
                    <img
                      src={user?.profileImage || 'https://via.placeholder.com/80'}
                      alt={user?.name || 'User'}
                      className="object-cover w-20 h-20 border-4 border-white rounded-full shadow-lg"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/80'}
                    />
                  </div>
                </div>
                <div className="pt-12 pb-4 text-center">
                  <h3 className="text-lg font-bold text-gray-800">{user?.name || 'User'}</h3>
                  <p className="text-sm text-gray-500">{user?.college || 'College'}</p>
                  <p className="text-xs text-gray-400">{user?.department || 'Department'} · {user?.year || 'Year'} Year</p>
                  
                  {/* Social Icons */}
                  <div className="flex justify-center mt-3 space-x-2">
                    {user?.socialLinks?.github && (
                      <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" 
                         className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <FaGithub className="w-4 h-4 text-gray-700" />
                      </a>
                    )}
                    {user?.socialLinks?.linkedin && (
                      <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                         className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <FaLinkedin className="w-4 h-4 text-blue-700" />
                      </a>
                    )}
                    {user?.socialLinks?.instagram && (
                      <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                         className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <FaInstagram className="w-4 h-4 text-pink-600" />
                      </a>
                    )}
                    {user?.socialLinks?.twitter && (
                      <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                         className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <FaTwitter className="w-4 h-4 text-blue-400" />
                      </a>
                    )}
                  </div>
                  
                  <Link
                    to="/profile"
                    className="inline-block px-6 py-2 mt-3 text-sm font-medium text-white transition-all shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
                  >
                    <UserIcon className="inline w-4 h-4 mr-1.5" />
                    View Profile
                  </Link>
                </div>
              </div>

              {/* 👥 Suggested Connections - Enhanced */}
              <div className="p-5 bg-white shadow-sm rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold tracking-wider text-gray-800 uppercase">
                    Suggested Connections
                  </h3>
                  <SparklesIcon className="w-4 h-4 text-yellow-500" />
                </div>
                {suggestionsArray.length === 0 ? (
                  <p className="py-4 text-sm text-center text-gray-400">No suggestions available</p>
                ) : (
                  <div className="space-y-3">
                    {suggestionsArray.slice(0, 5).map((suggestion) => (
                      <div key={suggestion._id} className="flex items-center justify-between p-2 transition-all group rounded-xl hover:bg-gray-50">
                        <Link to={`/students/${suggestion._id}`} className="flex items-center flex-1 space-x-3">
                          <div className="relative">
                            <img
                              src={suggestion.profileImage || 'https://via.placeholder.com/40'}
                              alt={suggestion.name}
                              className="object-cover w-10 h-10 border-2 border-gray-100 rounded-full"
                              onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                            />
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate transition-colors group-hover:text-blue-600">
                              {suggestion.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{suggestion.college || 'College'}</p>
                          </div>
                        </Link>
                        <button className="p-1.5 text-blue-600 transition-all bg-blue-50 rounded-full hover:bg-blue-100 hover:scale-110">
                          <UserPlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {suggestionsArray.length > 0 && (
                  <Link to="/students" className="block mt-4 text-sm font-medium text-center text-blue-600 hover:text-blue-700">
                    View All →
                  </Link>
                )}
              </div>

              {/* 📊 Quick Stats - Enhanced */}
              <div className="p-5 shadow-sm bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-2xl">
                <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-800 uppercase">Your Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white shadow-sm rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 rounded-xl">
                        <HeartIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Total Likes</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600">
                      {postsArray.reduce((acc, post) => acc + (post.likes?.length || 0), 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white shadow-sm rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-50 rounded-xl">
                        <BookmarkIcon className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Saved Posts</span>
                    </div>
                    <span className="text-sm font-bold text-purple-600">0</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white shadow-sm rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-50 rounded-xl">
                        <ShareIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Shares</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">0</span>
                  </div>
                </div>
              </div>

              {/* 📅 Upcoming Events Mini */}
              <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold tracking-wider text-gray-800 uppercase">Upcoming Events</h3>
                  <Link to="/events" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                    View All
                  </Link>
                </div>
                <div className="flex items-center justify-center py-6 text-center">
                  <div>
                    <div className="mb-2 text-3xl">📅</div>
                    <p className="text-sm text-gray-400">No upcoming events</p>
                    <Link to="/events/create" className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                      Create Event →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🔝 Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed z-50 p-3 text-white transition-all rounded-full shadow-lg bottom-8 right-8 bg-gradient-to-r from-blue-600 to-blue-700 shadow-blue-500/30 hover:scale-110 hover:shadow-blue-500/50"
          >
            <ArrowPathIcon className="w-5 h-5 transform rotate-0" />
          </button>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;