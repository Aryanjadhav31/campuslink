import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  PlusCircleIcon, 
  UserPlusIcon, 
  ArrowPathIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
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
      const { data } = await axios.get('http://localhost:5000/api/posts');
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

  return (
    <Layout activeTab="home" className="bg-gray-50 dark:bg-[#000000] text-gray-900 dark:text-white min-h-screen transition-colors duration-200">
      <div className="py-6 sm:py-8 px-4 sm:px-6 mx-auto max-w-[1020px]">
        <div className="flex gap-8 justify-center items-start">
          
          {/* Main Feed Column (~640px) */}
          <div className="w-full max-w-[640px] space-y-6 flex-1">
            
            {/* Create Post Prompt Banner */}
            <div className="p-4 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] rounded-2xl shadow-sm flex items-center space-x-3.5">
              <img
                src={user?.profileImage || 'https://via.placeholder.com/40'}
                alt={user?.name || 'User'}
                className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-[#262626]"
                onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
              />
              <Link
                to="/create-post"
                className="flex-1 bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#242424] hover:border-gray-300 dark:hover:border-[#383838] rounded-xl px-4 py-2.5 text-sm text-gray-500 dark:text-zinc-400 transition-colors truncate"
              >
                What's on your mind, {user?.name?.split(' ')[0] || 'student'}?
              </Link>
              <Link
                to="/create-post"
                className="px-4 py-2.5 bg-[#0095F6] hover:bg-[#0081D6] text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center shrink-0"
              >
                <PlusCircleIcon className="w-4 h-4 mr-1.5" />
                Post
              </Link>
            </div>

            {/* Posts Feed */}
            {postsArray.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center">
                  <DocumentTextIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">No posts yet</h3>
                <p className="mt-1 text-sm text-gray-400 dark:text-zinc-400">Discover and view posts from other students here</p>
                <div className="flex flex-col items-center justify-center gap-3 mt-6 sm:flex-row">
                  <Link 
                    to="/students" 
                    className="inline-flex items-center px-6 py-2.5 text-white font-semibold text-sm transition-all bg-blue-600 rounded-xl hover:bg-blue-700 hover:scale-105 shadow-md shadow-blue-500/20"
                  >
                    <UserPlusIcon className="w-4 h-4 mr-2" />
                    Find Students
                  </Link>
                  <Link 
                    to="/create-post"
                    className="inline-flex items-center px-6 py-2.5 text-gray-700 dark:text-zinc-300 font-semibold text-sm transition-all bg-gray-100 dark:bg-[#161616] rounded-xl hover:bg-gray-200 dark:hover:bg-[#242424]"
                  >
                    <PlusCircleIcon className="w-4 h-4 mr-2" />
                    Create Post
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
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

          {/* Desktop Right Sidebar: Suggested Connections Panel */}
          <div className="hidden lg:block w-[310px] space-y-5 flex-shrink-0 sticky top-6">
            {/* User Quick Profile Card */}
            <div className="p-4 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] rounded-2xl shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <img
                  src={user?.profileImage || 'https://via.placeholder.com/48'}
                  alt={user?.name || 'User'}
                  className="w-11 h-11 rounded-full object-cover border border-gray-200 dark:border-[#262626] shrink-0"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/48'}
                />
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">@{user?.username || 'student'}</p>
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
            <div className="p-4 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Campus Directory</span>
                <Link to="/students" className="text-xs font-semibold text-gray-900 dark:text-white hover:underline">
                  See All
                </Link>
              </div>

              <div className="space-y-3">
                <Link to="/students" className="flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      CL
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-[#0095F6] transition-colors">Campus Community</p>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-500">Connect with fellow students</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#0095F6]">Explore</span>
                </Link>
              </div>
            </div>

            {/* App Footer Info */}
            <p className="text-[11px] text-gray-400 dark:text-zinc-600 px-1">
              CampusLink • Student Network • © 2026
            </p>
          </div>

        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed z-50 p-3.5 text-white transition-all rounded-full shadow-xl bottom-8 right-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-110 shadow-blue-500/30"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        )}

      </div>
    </Layout>
  );
};

export default Dashboard;
