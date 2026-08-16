import React, { useState, useEffect, Fragment } from 'react';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
  PlusCircleIcon,
  UserPlusIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  UserIcon,
  PencilSquareIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/posts');
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (err) {
      console.error('❌ Error fetching posts:', err);
      setError('Failed to load feed. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[70vh] bg-gray-50 dark:bg-[#000000]">
          <div className="text-center">
            <div className="relative w-14 h-14 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-200 dark:border-zinc-700 rounded-full"></div>
              <div className="absolute inset-0 border-t-4 border-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-500 dark:text-zinc-400 animate-pulse">Loading feed...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh] bg-gray-50 dark:bg-[#000000]">
          <div className="max-w-md p-8 text-center bg-white dark:bg-[#111111] shadow-xl rounded-2xl border border-gray-100 dark:border-[#1F1F1F]">
            <div className="w-14 h-14 mx-auto mb-4 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
              <ArrowPathIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Oops! Something went wrong</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">{error}</p>
            <button
              onClick={() => fetchPosts()}
              className="inline-flex items-center px-6 py-2.5 mt-5 text-white font-semibold text-sm transition-all bg-blue-600 rounded-xl hover:bg-blue-700 hover:scale-105 shadow-md"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const postsArray = Array.isArray(posts) ? posts : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/students?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <Layout activeTab="home" className="bg-gray-50 dark:bg-[#000000] text-gray-900 dark:text-white min-h-screen transition-colors duration-200">
      
      {/* Centered Dashboard Container (Max-Width 1360px) */}
      <div className="py-4 sm:py-5 px-4 sm:px-6 mx-auto max-w-[1360px]">
        
        {/* Floating Top Bar: Search Bar (Centered) & Profile Avatar (Top-Right) */}
        <div className="relative flex items-center justify-between mb-3 min-h-[44px]">
          
          {/* Left Spacer for Balance */}
          <div className="w-10 shrink-0 hidden sm:block pointer-events-none" />

          {/* Centered Floating Premium Search Bar */}
          <div className="w-full max-w-[560px] mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full group">
              <MagnifyingGlassIcon className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students, communities, posts..."
                className="w-full h-[44px] pl-11 pr-4 bg-white/[0.04] hover:bg-white/[0.07] focus:bg-white/[0.09] text-white text-xs sm:text-sm placeholder-gray-400 rounded-full border border-white/[0.08] hover:border-blue-500/40 hover:shadow-[0_0_12px_rgba(59,130,246,0.25)] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-600/30 focus:outline-none focus:scale-[1.01] backdrop-blur-md transition-all duration-200"
              />
            </form>
          </div>

          {/* Top-Right Circular Profile Avatar & Glass Dropdown */}
          <div className="relative shrink-0 ml-3">
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="flex items-center justify-center p-0.5 rounded-full cursor-pointer focus:outline-none group">
                <img
                  src={user?.profileImage || 'https://via.placeholder.com/40'}
                  alt={user?.name || 'Profile'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/20 group-hover:border-blue-500/60 group-hover:scale-105 transition-all duration-200 shadow-md"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/40';
                  }}
                />
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="transform opacity-0 scale-95 -translate-y-1"
                enterTo="transform opacity-100 scale-100 translate-y-0"
                leave="transition ease-in duration-100"
                leaveFrom="transform opacity-100 scale-100 translate-y-0"
                leaveTo="transform opacity-0 scale-95 -translate-y-1"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 py-2 bg-[#161616]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl focus:outline-none z-50">
                  
                  {/* Header Profile Info inside Dropdown */}
                  <div className="px-4 py-2.5 border-b border-white/[0.08] mb-1">
                    <p className="text-sm font-bold text-white truncate">
                      {user?.name || 'Student'}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      @{user?.username || 'student'}
                    </p>
                  </div>

                  {/* 1. My Profile */}
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/profile"
                        className={`${
                          active ? 'bg-blue-600/20 text-white' : 'text-gray-300'
                        } flex items-center px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl mx-1 transition-colors duration-150`}
                      >
                        <UserIcon className="w-4 h-4 mr-3 text-blue-400" />
                        My Profile
                      </Link>
                    )}
                  </Menu.Item>

                  {/* 2. Edit Profile */}
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/settings?tab=profile"
                        className={`${
                          active ? 'bg-blue-600/20 text-white' : 'text-gray-300'
                        } flex items-center px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl mx-1 transition-colors duration-150`}
                      >
                        <PencilSquareIcon className="w-4 h-4 mr-3 text-blue-400" />
                        Edit Profile
                      </Link>
                    )}
                  </Menu.Item>

                  {/* 3. Saved Posts */}
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/profile?tab=saved"
                        className={`${
                          active ? 'bg-blue-600/20 text-white' : 'text-gray-300'
                        } flex items-center px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl mx-1 transition-colors duration-150`}
                      >
                        <BookmarkIcon className="w-4 h-4 mr-3 text-blue-400" />
                        Saved Posts
                      </Link>
                    )}
                  </Menu.Item>

                  {/* 4. Settings */}
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/settings"
                        className={`${
                          active ? 'bg-blue-600/20 text-white' : 'text-gray-300'
                        } flex items-center px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl mx-1 transition-colors duration-150`}
                      >
                        <Cog6ToothIcon className="w-4 h-4 mr-3 text-blue-400" />
                        Settings
                      </Link>
                    )}
                  </Menu.Item>

                  {/* 5. Theme Toggle Switch */}
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleTheme();
                        }}
                        className={`${
                          active ? 'bg-blue-600/20 text-white' : 'text-gray-300'
                        } flex items-center justify-between w-full px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl mx-1 transition-colors duration-150 cursor-pointer select-none`}
                        title="Toggle Theme"
                        aria-label="Toggle Theme"
                      >
                        <div className="flex items-center">
                          {isDark ? (
                            <MoonIcon className="w-4 h-4 mr-3 text-blue-400" />
                          ) : (
                            <SunIcon className="w-4 h-4 mr-3 text-amber-500" />
                          )}
                          <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                        </div>

                        {/* Modern iOS/Material Style Switcher */}
                        <div
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out ${
                            isDark ? 'bg-blue-600' : 'bg-gray-500/40'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-200 ease-in-out shadow-sm ${
                              isDark ? 'translate-x-4.5' : 'translate-x-1'
                            }`}
                          />
                        </div>
                      </button>
                    )}
                  </Menu.Item>

                  {/* 5. Logout */}
                  <div className="pt-1 mt-1 border-t border-white/[0.08]">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-red-500/20 text-red-400' : 'text-red-400'
                          } flex items-center w-full px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl mx-1 transition-colors duration-150`}
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3 text-red-400" />
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>

        </div>

        {/* Flexible Columns Container (28px gap, centered) */}
        <div className="flex gap-6 lg:gap-7 justify-center items-start">

          {/* Main Feed Column (Max-Width 700px) */}
          <div className="w-full max-w-[650px] lg:max-w-[700px] space-y-4 flex-1 min-w-0 mx-auto">

            {/* Create Post Prompt Banner (Target Height: 68–70px) */}
            <div className="p-3 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] rounded-2xl shadow-sm flex items-center space-x-3 h-[68px]">
              <img
                src={user?.profileImage || 'https://via.placeholder.com/36'}
                alt={user?.name || 'User'}
                className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-[#262626] shrink-0"
                onError={(e) => e.target.src = 'https://via.placeholder.com/36'}
              />
              <Link
                to="/create-post"
                className="flex-1 bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#242424] hover:border-gray-300 dark:hover:border-[#383838] rounded-full px-3.5 h-[38px] flex items-center text-xs sm:text-sm text-gray-500 dark:text-zinc-400 transition-colors truncate"
              >
                What's on your mind, {user?.name?.split(' ')[0] || 'student'}?
              </Link>
              <Link
                to="/create-post"
                className="px-3.5 h-[38px] bg-[#0095F6] hover:bg-[#0081D6] text-white text-xs font-semibold rounded-full transition-all shadow-md flex items-center shrink-0"
              >
                <PlusCircleIcon className="w-4 h-4 mr-1.5" />
                Post
              </Link>
            </div>

            {/* Posts Feed */}
            {postsArray.length === 0 ? (
              <div className="p-10 text-center bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] shadow-sm rounded-xl">
                <div className="w-14 h-14 mx-auto mb-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center">
                  <DocumentTextIcon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No posts yet</h3>
                <p className="mt-1 text-xs text-gray-400 dark:text-zinc-400">Discover and view posts from other students here</p>
                <div className="flex flex-col items-center justify-center gap-2.5 mt-5 sm:flex-row">
                  <Link
                    to="/students"
                    className="inline-flex items-center px-5 py-2 text-white font-semibold text-xs transition-all bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/20"
                  >
                    <UserPlusIcon className="w-3.5 h-3.5 mr-1.5" />
                    Find Students
                  </Link>
                  <Link
                    to="/create-post"
                    className="inline-flex items-center px-5 py-2 text-gray-700 dark:text-zinc-300 font-semibold text-xs transition-all bg-gray-100 dark:bg-[#161616] rounded-lg hover:bg-gray-200 dark:hover:bg-[#242424]"
                  >
                    <PlusCircleIcon className="w-3.5 h-3.5 mr-1.5" />
                    Create Post
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {postsArray.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onDeletePost={(deletedId) => {
                      setPosts(prev => prev.filter(p => p._id !== deletedId));
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop Right Sidebar (~300px) */}
          <div className="hidden lg:block w-[300px] space-y-4 flex-shrink-0 sticky top-5">
            {/* User Quick Profile Card */}
            <div className="p-3.5 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] rounded-xl shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <img
                  src={user?.profileImage || 'https://via.placeholder.com/40'}
                  alt={user?.name || 'User'}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-[#262626] shrink-0"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                />
                <div className="min-w-0">
                  <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">@{user?.username || 'student'}</p>
                </div>
              </div>
              <Link
                to="/profile"
                className="text-xs font-semibold text-[#0095F6] hover:text-[#0081D6] shrink-0 ml-2"
              >
                Profile
              </Link>
            </div>

            {/* Suggested Students Panel */}
            <div className="p-3.5 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] rounded-xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Campus Directory</span>
                <Link to="/students" className="text-xs font-semibold text-gray-900 dark:text-white hover:underline">
                  See All
                </Link>
              </div>

              <div className="space-y-2.5">
                <Link to="/students" className="flex items-center justify-between group">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                      CL
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-[#0095F6] transition-colors">Campus Community</p>
                      <p className="text-[10px] text-gray-500 dark:text-zinc-500">Connect with fellow students</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#0095F6]">Explore</span>
                </Link>
              </div>
            </div>

            {/* App Footer Info */}
            <p className="text-[10px] text-gray-400 dark:text-zinc-600 px-1">
              CampusLink • Student Network • © 2026
            </p>
          </div>

        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed z-50 p-3 text-white transition-all rounded-full shadow-xl bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-110 shadow-blue-500/30"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
        )}

      </div>
    </Layout>
  );
};

export default Dashboard;

