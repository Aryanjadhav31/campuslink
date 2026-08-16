import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import StoriesBar from '../components/StoriesBar';
import CreatePostWidget from '../components/CreatePostWidget';
import RightSidebar from '../components/RightSidebar';
import TopHeader from '../components/TopHeader';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import {
  ArrowPathIcon,
  DocumentTextIcon,
  UserPlusIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

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
      <Layout activeTab="home">
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-200 dark:border-zinc-800 rounded-full"></div>
              <div className="absolute inset-0 border-t-4 border-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 animate-pulse">Loading feed...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout activeTab="home">
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="max-w-md w-full p-6 text-center bg-white dark:bg-[#121212] shadow-lg rounded-2xl border border-gray-200 dark:border-[#262626]">
            <div className="w-12 h-12 mx-auto mb-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
              <ArrowPathIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Unable to load posts</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">{error}</p>
            <button
              onClick={() => fetchPosts()}
              className="inline-flex items-center px-5 py-2 mt-4 text-white font-semibold text-xs transition-all bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md"
            >
              <ArrowPathIcon className="w-3.5 h-3.5 mr-1.5" />
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const postsArray = Array.isArray(posts) ? posts : [];

  return (
    <Layout activeTab="home" className="bg-gray-50 dark:bg-[#000000] text-gray-900 dark:text-white min-h-screen transition-colors duration-200">
      
      {/* Desktop Sticky Header with Search & Profile */}
      <div className="hidden md:block">
        <TopHeader />
      </div>

      {/* Main Feed Container */}
      <div className="py-4 px-4 sm:px-6 mx-auto max-w-[1280px]">
        
        {/* Layout Columns: Social Feed + Right Sidebar */}
        <div className="flex gap-7 justify-center items-start">

          {/* Main Feed Column */}
          <div className="w-full max-w-[650px] space-y-4 flex-1 min-w-0 mx-auto">

            {/* Stories / Campus Moments Bar */}
            <StoriesBar />

            {/* Quick Create Post Composer */}
            <CreatePostWidget />

            {/* Posts Feed */}
            {postsArray.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#262626] shadow-sm rounded-2xl">
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Be the first to share something!</h3>
                <p className="mt-1 text-xs text-gray-400 dark:text-zinc-400">Discover and view posts from fellow students across your campus.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mt-4">
                  <Link
                    to="/students"
                    className="inline-flex items-center px-4 py-2 text-white font-semibold text-xs transition-all bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md"
                  >
                    <UserPlusIcon className="w-3.5 h-3.5 mr-1.5" />
                    Discover Students
                  </Link>
                  <Link
                    to="/create-post"
                    className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-zinc-300 font-semibold text-xs transition-all bg-gray-100 dark:bg-[#1A1A1A] rounded-xl hover:bg-gray-200 dark:hover:bg-[#222222]"
                  >
                    <PlusCircleIcon className="w-3.5 h-3.5 mr-1.5" />
                    Create Post
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
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

          {/* Desktop Right Sidebar */}
          <RightSidebar />

        </div>

        {/* Scroll to Top Floating Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="fixed z-50 p-3 text-white transition-all rounded-full shadow-xl bottom-20 md:bottom-8 right-6 bg-blue-600 hover:bg-blue-700 hover:scale-110 shadow-blue-500/30"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
        )}

      </div>
    </Layout>
  );
};

export default Dashboard;

