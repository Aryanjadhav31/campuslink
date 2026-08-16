import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeftIcon,
  UserGroupIcon,
  GlobeAltIcon,
  LockClosedIcon,
  UserPlusIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline';

const CommunityDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState(null);

  useEffect(() => {
    fetchCommunityDetails();
  }, [id]);

  const fetchCommunityDetails = async () => {
    try {
      const { data } = await api.get(`/communities/${id}`);
      setCommunity(data.community);
      setPosts(data.posts || []);
      
      const member = data.community.members.some(
        m => m._id === user?._id
      );
      setIsMember(member);
    } catch (error) {
      console.error('Error fetching community:', error);
      toast.error('Failed to load community');
      navigate('/communities');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      await api.post(`/communities/${id}/join`);
      toast.success('Joined community!');
      setIsMember(true);
      fetchCommunityDetails();
    } catch (error) {
      toast.error('Failed to join community');
    }
  };

  const handleLeave = async () => {
    try {
      await api.post(`/communities/${id}/leave`);
      toast.success('Left community');
      setIsMember(false);
      fetchCommunityDetails();
    } catch (error) {
      toast.error('Failed to leave community');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    try {
      let imageUrl = null;
      if (postImage) {
        const formData = new FormData();
        formData.append('image', postImage);
        const { data } = await api.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = data.url;
      }

      const { data } = await api.post('/posts', {
        content: postContent,
        images: imageUrl ? [imageUrl] : [],
        community: id
      });

      setPosts(prev => [data, ...prev]);
      setPostContent('');
      setPostImage(null);
      setShowNewPost(false);
      toast.success('Post created!');
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (!community) {
    return (
      <Layout>
        <div className="py-12 text-center">
          <p className="text-gray-500">Community not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/communities')}
          className="flex items-center mb-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-1" />
          Back to Communities
        </button>

        {/* Community Header */}
        <div className="overflow-hidden bg-white shadow-sm rounded-xl">
          {community.coverImage ? (
            <img
              src={community.coverImage}
              alt={community.name}
              className="object-cover w-full h-48"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          )}
          
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{community.name}</h2>
                <p className="mt-2 text-gray-600">{community.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1 text-sm text-blue-800 bg-blue-100 rounded-full">
                    {community.category}
                  </span>
                  <span className="flex items-center px-3 py-1 text-sm text-gray-800 bg-gray-100 rounded-full">
                    <UserGroupIcon className="w-4 h-4 mr-1" />
                    {community.members.length} members
                  </span>
                  {community.isPrivate ? (
                    <span className="flex items-center px-3 py-1 text-sm text-yellow-800 bg-yellow-100 rounded-full">
                      <LockClosedIcon className="w-4 h-4 mr-1" />
                      Private
                    </span>
                  ) : (
                    <span className="flex items-center px-3 py-1 text-sm text-green-800 bg-green-100 rounded-full">
                      <GlobeAltIcon className="w-4 h-4 mr-1" />
                      Public
                    </span>
                  )}
                </div>
              </div>
              
              {community.admin && community.admin._id === user?._id ? (
                <span className="px-4 py-2 text-sm text-purple-800 bg-purple-100 rounded-lg">
                  Admin
                </span>
              ) : isMember ? (
                <button
                  onClick={handleLeave}
                  className="flex items-center px-4 py-2 text-sm text-red-700 transition-colors bg-red-100 rounded-lg hover:bg-red-200"
                >
                  <UserMinusIcon className="w-4 h-4 mr-1" />
                  Leave
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  className="flex items-center px-4 py-2 text-sm text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <UserPlusIcon className="w-4 h-4 mr-1" />
                  Join Community
                </button>
              )}
            </div>

            {/* Admin Info */}
            {community.admin && (
              <div className="flex items-center mt-4 space-x-2 text-sm text-gray-600">
                <span>Admin:</span>
                <Link to={`/students/${community.admin._id}`} className="text-blue-600 hover:underline">
                  {community.admin.name}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Posts Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Community Posts</h3>
            {isMember && (
              <button
                onClick={() => setShowNewPost(!showNewPost)}
                className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                {showNewPost ? 'Cancel' : 'Create Post'}
              </button>
            )}
          </div>

          {/* Create Post Form */}
          {showNewPost && isMember && (
            <div className="p-6 mb-6 bg-white shadow-sm rounded-xl">
              <form onSubmit={handleCreatePost}>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What's on your mind?"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                
                <div className="flex items-center mt-3 space-x-4">
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 text-sm text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200">
                      Add Image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPostImage(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  
                  {postImage && (
                    <span className="text-sm text-green-600">
                      {postImage.name}
                    </span>
                  )}
                  
                  <button
                    type="submit"
                    className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Posts List */}
          {posts.length === 0 ? (
            <div className="p-8 text-center bg-white shadow-sm rounded-xl">
              <p className="text-gray-500">No posts in this community yet</p>
              {isMember && (
                <button
                  onClick={() => setShowNewPost(true)}
                  className="mt-2 text-blue-600 hover:underline"
                >
                  Be the first to post
                </button>
              )}
            </div>
          ) : (
            posts.map(post => (
              <PostCard key={post._id} post={post} />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CommunityDetails;