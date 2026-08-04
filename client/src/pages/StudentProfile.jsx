import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  UserIcon,
  UserPlusIcon,
  UserMinusIcon,
  GlobeAltIcon,
  Squares2X2Icon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

// Brand Social Media Icons
import { 
  FaGithub, 
  FaLinkedin, 
  FaInstagram, 
  FaSnapchat, 
  FaTwitter, 
  FaTelegram
} from 'react-icons/fa';

const StudentProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const navigate = useNavigate();
  
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [friendRequestStatus, setFriendRequestStatus] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  
  // Student Posts & Modal state
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  // Social Platforms Configuration (Matches user Profile page)
  const platforms = [
    { key: 'github', label: 'GitHub', icon: FaGithub, ring: 'ring-2 ring-zinc-400', bg: 'bg-zinc-900', text: 'text-white' },
    { key: 'linkedin', label: 'LinkedIn', icon: FaLinkedin, ring: 'ring-2 ring-[#0A66C2]', bg: 'bg-[#0A66C2]/15', text: 'text-[#0A66C2]' },
    { key: 'instagram', label: 'Instagram', icon: FaInstagram, ring: 'ring-2 ring-pink-500', bg: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600', text: 'text-white' },
    { key: 'telegram', label: 'Telegram', icon: FaTelegram, ring: 'ring-2 ring-[#229ED9]', bg: 'bg-[#229ED9]/15', text: 'text-[#229ED9]' },
    { key: 'snapchat', label: 'Snapchat', icon: FaSnapchat, ring: 'ring-2 ring-[#FFFC00]', bg: 'bg-[#FFFC00]/15', text: 'text-[#FFFC00]' },
    { key: 'twitter', label: 'Twitter/X', icon: FaTwitter, ring: 'ring-2 ring-sky-400', bg: 'bg-sky-400/15', text: 'text-sky-400' },
    { key: 'portfolio', label: 'Portfolio', icon: GlobeAltIcon, ring: 'ring-2 ring-emerald-500', bg: 'bg-emerald-500/15', text: 'text-emerald-400' }
  ];

  useEffect(() => {
    fetchUserData();
    fetchFriendRequests();
    fetchStudentPosts();
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`http://localhost:5000/api/users/${id}`);
      setProfileUser(data);
      
      const checkFriend = user?.friends?.some(f => f._id === id);
      setIsFriend(checkFriend);
    } catch (error) {
      console.error('Error fetching student profile:', error);
      toast.error('Failed to load student profile');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentPosts = async () => {
    try {
      setPostsLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/posts');
      const filtered = data.posts?.filter(p => (p.user?._id || p.user) === id) || [];
      setPosts(filtered);
    } catch (error) {
      console.error('Error fetching student posts:', error);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/friends/requests');
      setFriendRequests(data);
      
      const pendingRequest = data.find(
        req => req.sender._id === id || req.receiver._id === id
      );
      if (pendingRequest) {
        setFriendRequestStatus(pendingRequest.status);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      await axios.post('http://localhost:5000/api/friends/request', { receiverId: id });
      toast.success('Friend request sent!');
      setFriendRequestStatus('pending');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    }
  };

  const handleAcceptRequest = async () => {
    const request = friendRequests.find(req => req.sender._id === id);
    if (!request) return;

    try {
      await axios.post('http://localhost:5000/api/friends/accept', { requestId: request._id });
      toast.success('Friend request accepted!');
      setIsFriend(true);
      setFriendRequestStatus('accepted');
      fetchUserData();
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async () => {
    const request = friendRequests.find(req => req.sender._id === id);
    if (!request) return;

    try {
      await axios.post('http://localhost:5000/api/friends/reject', { requestId: request._id });
      toast.success('Friend request rejected');
      setFriendRequestStatus('rejected');
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const handleRemoveFriend = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/friends/${id}`);
      toast.success('Friend removed');
      setIsFriend(false);
      setFriendRequestStatus(null);
      fetchUserData();
    } catch (error) {
      toast.error('Failed to remove friend');
    }
  };

  const getSocialLink = (key) => {
    return profileUser?.socialLinks?.[key] || '';
  };

  const isOnline = onlineUsers.includes(id);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 mx-auto border-2 border-zinc-400 dark:border-zinc-700 border-t-blue-600 dark:border-t-white rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (!profileUser) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <p className="text-gray-500 dark:text-zinc-400 text-base font-medium">Student profile not found</p>
          <Link to="/students" className="inline-block mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold">
            Back to Directory
          </Link>
        </div>
      </Layout>
    );
  }

  const isOwnProfile = user?._id === id;
  const isPending = friendRequestStatus === 'pending';
  const isFriendRequestSent = friendRequests.some(
    req => req.sender._id === user?._id && req.receiver._id === id && req.status === 'pending'
  );

  return (
    <Layout>
      <div className="w-full flex justify-center py-6 sm:py-10">
        <main className="w-full max-w-[935px] px-4 sm:px-8">

          {/* Profile Header (Instagram Split Layout - Identical to own Profile page) */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-16 mb-8">

            {/* Profile Picture (Large ~150px) with Default Placeholder Silhouette */}
            <div className="relative flex-shrink-0">
              <div className="w-[140px] h-[140px] sm:w-[150px] sm:h-[150px] rounded-full p-0.5 border-2 border-gray-300 dark:border-[#262626] bg-gray-100 dark:bg-[#121212] overflow-hidden shadow-2xl flex items-center justify-center">
                {profileUser.profileImage ? (
                  <img
                    src={profileUser.profileImage}
                    alt={profileUser.name}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full rounded-full flex items-center justify-center bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 ${profileUser.profileImage ? 'hidden' : 'flex'}`}>
                  <UserIcon className="w-20 h-20" />
                </div>
              </div>
              {isOnline && (
                <span className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-[#000000] rounded-full shadow-md" title="Online now"></span>
              )}
            </div>

            {/* Profile Info Details */}
            <div className="flex-1 space-y-3.5 text-left w-full">

              {/* 1. Primary Name / Username */}
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 dark:text-white tracking-tight">
                  {profileUser.username || profileUser.name}
                </h1>
              </div>

              {/* 2. Secondary Full Name (Only when a distinct username exists) */}
              {profileUser?.username && profileUser?.username.toLowerCase().replace(/\s+/g, '_') !== profileUser?.name?.toLowerCase().replace(/\s+/g, '_') && (
                <p className="text-sm font-semibold text-gray-500 dark:text-[#A8A8A8]">
                  {profileUser?.name}
                </p>
              )}

              {/* 3. College Name */}
              <p className="font-bold text-gray-900 dark:text-white text-base">
                {profileUser.college || 'Campus Student'}
              </p>

              {/* 4. Department • Academic Year Info */}
              <div className="space-y-1">
                <p className="text-gray-500 dark:text-zinc-400 text-sm font-medium">
                  {profileUser.department} • {profileUser.year} Year
                </p>
                {profileUser.bio && (
                  <p className="text-gray-700 dark:text-zinc-300 mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                    {profileUser.bio}
                  </p>
                )}
              </div>

              {/* 5. Visitor Action Button (Add Friend / Unfriend / Request Pending / Accept / Reject - NO Message button) */}
              {!isOwnProfile && (
                <div className="flex items-center pt-1">
                  {isFriend ? (
                    <button
                      onClick={handleRemoveFriend}
                      className="flex items-center px-4 py-2 text-red-600 dark:text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    >
                      <UserMinusIcon className="w-4 h-4 mr-1.5" />
                      Unfriend
                    </button>
                  ) : isPending || isFriendRequestSent ? (
                    <button
                      disabled
                      className="px-5 py-2 bg-gray-200 dark:bg-[#1A1A1A] text-gray-500 dark:text-zinc-400 rounded-lg text-xs font-semibold cursor-not-allowed border border-gray-300 dark:border-[#262626]"
                    >
                      Request Pending
                    </button>
                  ) : friendRequestStatus === 'pending' ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAcceptRequest}
                        className="flex items-center px-4 py-2 text-white font-semibold text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all cursor-pointer"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                        Accept
                      </button>
                      <button
                        onClick={handleRejectRequest}
                        className="flex items-center px-4 py-2 text-white font-semibold text-xs rounded-lg bg-red-600 hover:bg-red-500 shadow-sm transition-all cursor-pointer"
                      >
                        <XCircleIcon className="w-4 h-4 mr-1.5" />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleSendFriendRequest}
                      className="flex items-center px-5 py-2 text-white font-semibold text-xs rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:scale-[1.02] shadow-sm hover:shadow-md transition-all cursor-pointer"
                    >
                      <UserPlusIcon className="w-4 h-4 mr-1.5" />
                      Add Friend
                    </button>
                  )}
                </div>
              )}

              {/* 6. Inline Stats Row (posts / friends / following - Exact same styling as own Profile page) */}
              <div className="flex items-center space-x-10 text-base pt-1">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white mr-1.5">{posts.length}</span>
                  <span className="text-gray-500 dark:text-[#A8A8A8] font-normal">posts</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white mr-1.5">{profileUser.friends?.length || 0}</span>
                  <span className="text-gray-500 dark:text-[#A8A8A8] font-normal">friends</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white mr-1.5">{profileUser.following?.length || 0}</span>
                  <span className="text-gray-500 dark:text-[#A8A8A8] font-normal">following</span>
                </div>
              </div>

            </div>
          </div>

          {/* Social Links Row — Same circular 66px icon row as own Profile page */}
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

                // Muted circle for unlinked platform
                return (
                  <div
                    key={platform.key}
                    className="flex flex-col items-center opacity-40 select-none"
                    title={`${platform.label} not connected`}
                  >
                    <div className="w-[66px] h-[66px] rounded-full p-0.5 ring-1 ring-gray-300 dark:ring-zinc-700 bg-gray-100 dark:bg-[#121212] flex items-center justify-center border border-gray-200 dark:border-[#262626]">
                      <Icon className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium mt-2">
                      {platform.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Posts Tab Bar & Grid — Single "Posts" Tab, NO Saved Tab for Visitor */}
          <div>
            <div className="mb-8 flex items-center justify-center">
              <div className="flex items-center space-x-2 py-2 text-xs font-bold uppercase tracking-widest border-b-2 border-blue-600 text-blue-600 dark:border-white dark:text-white">
                <Squares2X2Icon className="w-4 h-4 mr-1.5" />
                <span>Posts</span>
              </div>
            </div>

            {/* Posts Thumbnails Grid (3 Columns, Square aspect ratio) */}
            {postsLoading ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 mx-auto border-2 border-zinc-400 dark:border-zinc-700 border-t-blue-600 dark:border-t-white rounded-full animate-spin"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-[#121212] border border-gray-200 dark:border-[#262626] flex items-center justify-center text-gray-500 dark:text-zinc-500">
                  <Squares2X2Icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Posts Yet</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-500">When this student shares photos or updates, they will appear on their profile.</p>
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

export default StudentProfile;