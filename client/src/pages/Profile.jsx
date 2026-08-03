import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import {
  PencilIcon,
  Cog6ToothIcon,
  Squares2X2Icon,
  BookmarkIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import PostCard from '../components/PostCard';

// ✅ Social Media Icons
import {
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaSnapchat,
  FaTwitter,
  FaYoutube,
  FaFacebook,
  FaDiscord,
  FaTelegram,
  FaWhatsapp
} from 'react-icons/fa';

const Profile = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'saved' ? 'saved' : 'posts';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const fetchUserPosts = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/posts');
      const userPosts = data.posts?.filter(p => p.user?._id === user?._id) || [];
      setPosts(userPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Social Platforms Configuration with Brand Colored Rings & 66px Circles
  const platforms = [
    { key: 'github', label: 'GitHub', icon: FaGithub, ring: 'ring-2 ring-zinc-400', bg: 'bg-zinc-900', text: 'text-white' },
    { key: 'linkedin', label: 'LinkedIn', icon: FaLinkedin, ring: 'ring-2 ring-[#0A66C2]', bg: 'bg-[#0A66C2]/15', text: 'text-[#0A66C2]' },
    { key: 'instagram', label: 'Instagram', icon: FaInstagram, ring: 'ring-2 ring-pink-500', bg: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600', text: 'text-white' },
    { key: 'telegram', label: 'Telegram', icon: FaTelegram, ring: 'ring-2 ring-[#229ED9]', bg: 'bg-[#229ED9]/15', text: 'text-[#229ED9]' },
    { key: 'snapchat', label: 'Snapchat', icon: FaSnapchat, ring: 'ring-2 ring-[#FFFC00]', bg: 'bg-[#FFFC00]/15', text: 'text-[#FFFC00]' },
    { key: 'twitter', label: 'Twitter/X', icon: FaTwitter, ring: 'ring-2 ring-sky-400', bg: 'bg-sky-400/15', text: 'text-sky-400' },
    { key: 'portfolio', label: 'Portfolio', icon: GlobeAltIcon, ring: 'ring-2 ring-emerald-500', bg: 'bg-emerald-500/15', text: 'text-emerald-400' }
  ];

  const getSocialLink = (key) => {
    return user?.socialLinks?.[key] || '';
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-zinc-500 font-medium">Please login to view your profile</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeTab="profile">
      <div className="w-full flex justify-center py-6 sm:py-10">
        <main className="w-full max-w-[935px] px-4 sm:px-8">

          {/* Profile Header (Instagram Split Layout) */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-16 mb-8">

            {/* Profile Picture (Large ~150px) */}
            <div className="relative flex-shrink-0">
              <div className="w-[140px] h-[140px] sm:w-[150px] sm:h-[150px] rounded-full p-0.5 border-2 border-gray-300 dark:border-[#262626] bg-gray-100 dark:bg-[#121212] overflow-hidden shadow-2xl">
                <img
                  src={user?.profileImage || 'https://via.placeholder.com/150'}
                  alt={user?.name}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                />
              </div>
            </div>

            {/* Profile Info Details */}
            <div className="flex-1 space-y-3.5 text-left w-full">

              {/* 1. Username + Gear Settings Icon */}
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 dark:text-white tracking-tight">
                  {user?.username || user?.name?.toLowerCase().replace(/\s+/g, '_') || 'username'}
                </h1>
                <Link
                  to="/settings"
                  className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-[#1a1a1a] text-zinc-500 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  title="Account Settings"
                >
                  <Cog6ToothIcon className="w-6 h-6" />
                </Link>
              </div>

              {/* 2. Full Name */}
              <p className="text-sm font-semibold text-gray-500 dark:text-[#A8A8A8]">
                {user?.name}
              </p>

              {/* 3. College Name */}
              <p className="font-bold text-gray-900 dark:text-white text-base">
                {user?.college || 'Campus Student'}
              </p>

              {/* 4. Department • Year Info */}
              <div className="space-y-1">
                <p className="text-gray-500 dark:text-zinc-400 text-sm font-medium">
                  {user?.department} • {user?.year} Year
                </p>
                {user?.bio && (
                  <p className="text-gray-700 dark:text-zinc-300 mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                    {user.bio}
                  </p>
                )}
              </div>

              {/* 5. Stats Row (posts / friends / following) */}
              <div className="flex items-center space-x-10 text-base pt-1">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white mr-1.5">{posts.length}</span>
                  <span className="text-gray-500 dark:text-[#A8A8A8] font-normal">posts</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white mr-1.5">{user?.friends?.length || 0}</span>
                  <span className="text-gray-500 dark:text-[#A8A8A8] font-normal">friends</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white mr-1.5">{user?.following?.length || 0}</span>
                  <span className="text-gray-500 dark:text-[#A8A8A8] font-normal">following</span>
                </div>
              </div>

            </div>
          </div>

          {/* Social Links Row — Visual Spacing Only, NO Divider Lines */}
          <div className="mb-8 py-2 overflow-x-auto select-none no-scrollbar">
            <div className="flex items-center space-x-6 min-w-max px-2">
              {platforms.map((platform) => {
                const linkUrl = getSocialLink(platform.key);
                const Icon = platform.icon;

                if (linkUrl) {
                  return (
                    <a
                      key={platform.key}
                      href={linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center group cursor-pointer"
                    >
                      {/* 66px Circle with Colored Ring */}
                      <div className={`w-[66px] h-[66px] rounded-full p-0.5 ${platform.ring} transition-transform duration-200 group-hover:scale-105 flex items-center justify-center shadow-xl`}>
                        <div className={`w-full h-full rounded-full ${platform.bg} flex items-center justify-center ${platform.text}`}>
                          <Icon className="w-7 h-7" />
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 dark:text-zinc-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors mt-2">
                        {platform.label}
                      </span>
                    </a>
                  );
                }

                // Muted "+" Circle for unlinked platform (66px)
                return (
                  <Link
                    key={platform.key}
                    to="/settings"
                    className="flex flex-col items-center group opacity-60 hover:opacity-100 transition-all duration-200"
                    title={`Add ${platform.label} link in Settings`}
                  >
                    <div className="w-[66px] h-[66px] rounded-full p-0.5 ring-1 ring-gray-300 dark:ring-zinc-700 bg-gray-100 dark:bg-[#121212] flex items-center justify-center border border-gray-200 dark:border-[#262626] group-hover:border-zinc-500">
                      <PlusIcon className="w-6 h-6 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-200" />
                    </div>
                    <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium mt-2 group-hover:text-gray-600 dark:group-hover:text-zinc-300">
                      {platform.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Posts Tab Bar & Grid — Visual Spacing Only, NO Divider Line */}
          <div>

            {/* Tab Navigation */}
            <div className="mb-8 flex items-center justify-center space-x-12">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex items-center space-x-2 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer ${activeTab === 'posts'
                  ? 'border-blue-600 text-blue-600 dark:border-white dark:text-white'
                  : 'border-transparent text-gray-400 dark:text-[#737373] hover:text-gray-600 dark:hover:text-zinc-300'
                  }`}
              >
                <Squares2X2Icon className="w-4 h-4" />
                <span>Posts</span>
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex items-center space-x-2 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer ${activeTab === 'saved'
                  ? 'border-blue-600 text-blue-600 dark:border-white dark:text-white'
                  : 'border-transparent text-gray-400 dark:text-[#737373] hover:text-gray-600 dark:hover:text-zinc-300'
                  }`}
              >
                <BookmarkIcon className="w-4 h-4" />
                <span>Saved</span>
              </button>
            </div>

            {/* Posts Thumbnails Grid (3 Columns, Square aspect ratio) */}
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 mx-auto border-2 border-zinc-400 dark:border-zinc-700 border-t-blue-600 dark:border-t-white rounded-full animate-spin"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-[#121212] border border-gray-200 dark:border-[#262626] flex items-center justify-center text-gray-500 dark:text-zinc-500">
                  <Squares2X2Icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Posts Yet</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-500">When you share photos or updates, they will appear on your profile.</p>
                <Link
                  to="/create-post"
                  className="inline-block px-5 py-2 mt-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Share First Post
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 sm:gap-4 mt-6">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    onClick={() => setSelectedPost(post)}
                    className="relative aspect-square bg-gray-100 dark:bg-[#121212] border border-gray-200 dark:border-[#262626] rounded-md overflow-hidden group cursor-pointer"
                  >
                    {post.images && post.images.length > 0 ? (
                      <img
                        src={post.images[0]}
                        alt="Post thumbnail"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full p-4 flex items-center justify-center text-center bg-gray-100 dark:bg-zinc-900 text-gray-800 dark:text-zinc-300 text-xs sm:text-sm font-medium line-clamp-4 leading-snug">
                        {post.content}
                      </div>
                    )}

                    {/* Hover Overlay with Likes & Comments Count */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-6 text-white font-bold text-sm">
                      <div className="flex items-center space-x-1.5">
                        <HeartSolidIcon className="w-5 h-5 text-white" />
                        <span>{post.likes?.length || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <ChatBubbleLeftIcon className="w-5 h-5 text-white" />
                        <span>{post.comments?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Selected Post Detail Modal */}
          {selectedPost && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
              <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-transparent pt-10">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-0 right-0 p-2.5 text-zinc-300 hover:text-white bg-black/80 hover:bg-black/95 border border-white/10 rounded-full transition-all cursor-pointer shadow-xl z-50"
                  title="Close Post"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
                <PostCard
                  post={selectedPost}
                  onDeletePost={(deletedId) => {
                    setPosts(prev => prev.filter(p => p._id !== deletedId));
                    setSelectedPost(null);
                  }}
                />
              </div>
            </div>
          )}

        </main>
      </div>
    </Layout>
  );
};

export default Profile;
