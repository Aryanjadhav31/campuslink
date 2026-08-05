import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { posts, upload, communities as communitiesApi } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { 
  XMarkIcon,
  PhotoIcon,
  UsersIcon,
  GlobeAltIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [communities, setCommunities] = useState([]);
  const [showCommunitySelect, setShowCommunitySelect] = useState(false);
  const [fetchingCommunities, setFetchingCommunities] = useState(false);
  const [error, setError] = useState(null);

  // Fetch communities on component mount
  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setFetchingCommunities(true);
      setError(null);
      
      console.log('📥 Fetching communities...');
      const { data } = await communitiesApi.getAll();
      
      console.log('📋 Communities response:', data);
      
      let communitiesArray = [];
      if (Array.isArray(data)) {
        communitiesArray = data;
      } else if (data && typeof data === 'object' && Array.isArray(data.communities)) {
        communitiesArray = data.communities;
      }
      
      // Filter communities where user is a member
      const userCommunities = communitiesArray.filter(community => {
        if (!community || !community.members) return false;
        return community.members.some(m => (m._id || m) === user?._id);
      });
      
      console.log('👥 User communities:', userCommunities);
      setCommunities(userCommunities);
      
    } catch (error) {
      console.error('❌ Error fetching communities:', error);
      setError('Failed to load communities');
      setCommunities([]);
    } finally {
      setFetchingCommunities(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, {
          file,
          preview: reader.result,
          id: Date.now() + Math.random()
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    e.target.value = '';
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedContent = content.trim();
    if (!trimmedContent && images.length === 0) {
      toast.error('Please add text or at least one image to post.');
      return;
    }

    setLoading(true);
    
    try {
      console.log('📤 Processing post upload...');
      
      // Upload images using upload service
      const imageUrls = [];
      if (images.length > 0) {
        for (const image of images) {
          try {
            console.log('📤 Uploading image file:', image.file.name);
            const { data } = await upload.image(image.file);
            if (data?.url) {
              imageUrls.push(data.url);
              console.log('✅ Image uploaded:', data.url);
            }
          } catch (uploadError) {
            console.error('❌ Image upload error:', uploadError);
            toast.error(`Failed to upload ${image.file.name}`);
          }
        }
      }

      // If user selected images but none succeeded, abort post creation
      if (images.length > 0 && imageUrls.length === 0 && !trimmedContent) {
        toast.error('Image upload failed. Please try again.');
        setLoading(false);
        return;
      }

      // Create post payload
      const postPayload = {
        content: trimmedContent,
        images: imageUrls,
        community: selectedCommunity || undefined
      };

      console.log('📤 Sending post creation request:', postPayload);
      
      const { data } = await posts.create(postPayload);
      
      console.log('✅ Post created successfully:', data);
      toast.success('Post created successfully! 🎉');
      
      // Clear form state
      setContent('');
      setImages([]);
      setSelectedCommunity('');
      
      // Redirect to Home Feed
      navigate('/dashboard');
      
    } catch (error) {
      console.error('❌ Error creating post:', error);
      const serverMessage = error.response?.data?.message;
      toast.error(serverMessage || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const communitiesArray = Array.isArray(communities) ? communities : [];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-6 px-4">
        <div className="p-6 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] text-gray-900 dark:text-white shadow-sm rounded-xl">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Create Post</h2>
          
          <form onSubmit={handleSubmit}>
            {/* User Info */}
            <div className="flex items-center mb-4 space-x-3">
              <img
                src={user?.profileImage || 'https://via.placeholder.com/40'}
                alt={user?.name || 'User'}
                className="object-cover w-10 h-10 border-2 border-gray-200 dark:border-[#262626] rounded-full"
                onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-zinc-400">
                  {selectedCommunity ? (
                    <span>
                      Posting in{' '}
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {communitiesArray.find(c => c._id === selectedCommunity)?.name || 'Community'}
                      </span>
                    </span>
                  ) : (
                    <span>Posting publicly</span>
                  )}
                </div>
              </div>
            </div>

            {/* Content Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows="4"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 transition rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4 sm:grid-cols-3">
                {images.map((image) => (
                  <div key={image.id} className="relative group aspect-square bg-[#111111] rounded-[16px] overflow-hidden border border-gray-200/50 dark:border-[#1F1F1F]">
                    <img
                      src={image.preview}
                      alt="Upload Preview"
                      className="w-full h-full object-contain p-1 rounded-[16px]"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute p-1.5 text-white transition-colors bg-red-600/90 hover:bg-red-600 rounded-full opacity-90 sm:opacity-0 sm:group-hover:opacity-100 top-2 right-2 cursor-pointer shadow-md"
                      disabled={loading}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Post Option Controls */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <label className="cursor-pointer">
                <span className="flex items-center px-4 py-2 text-gray-700 dark:text-zinc-300 transition-colors bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#262626] rounded-lg text-sm font-medium">
                  <PhotoIcon className="w-5 h-5 mr-2 text-blue-500" />
                  Add Images
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={loading || images.length >= 5}
                />
              </label>

              <button
                type="button"
                onClick={() => setShowCommunitySelect(!showCommunitySelect)}
                className="flex items-center px-4 py-2 text-gray-700 dark:text-zinc-300 transition-colors bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#262626] rounded-lg text-sm font-medium cursor-pointer"
                disabled={loading}
              >
                {selectedCommunity ? (
                  <UsersIcon className="w-5 h-5 mr-2 text-blue-500" />
                ) : (
                  <GlobeAltIcon className="w-5 h-5 mr-2 text-emerald-500" />
                )}
                {selectedCommunity ? 'Community Post' : 'Public Post'}
              </button>

              {showCommunitySelect && (
                <div className="w-full p-2 mt-2 overflow-y-auto border border-gray-200 dark:border-[#262626] rounded-lg bg-gray-50 dark:bg-[#161616] max-h-48">
                  {fetchingCommunities ? (
                    <div className="py-4 text-center">
                      <div className="w-6 h-6 mx-auto border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                      <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">Loading communities...</p>
                    </div>
                  ) : communitiesArray.length === 0 ? (
                    <p className="py-2 text-sm text-center text-gray-500 dark:text-zinc-400">
                      No communities joined yet
                    </p>
                  ) : (
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCommunity('');
                          setShowCommunitySelect(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222] transition-colors ${
                          !selectedCommunity ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : ''
                        }`}
                      >
                        <GlobeAltIcon className="inline w-4 h-4 mr-2" />
                        Public Post
                      </button>
                      {communitiesArray.map(community => (
                        <button
                          key={community._id}
                          type="button"
                          onClick={() => {
                            setSelectedCommunity(community._id);
                            setShowCommunitySelect(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222] transition-colors ${
                            selectedCommunity === community._id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : ''
                          }`}
                        >
                          <UsersIcon className="inline w-4 h-4 mr-2" />
                          {community.name}
                          <span className="ml-2 text-xs text-gray-400 dark:text-zinc-500">
                            ({community.members?.length || 0} members)
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Actions */}
            <div className="flex mt-6 space-x-3">
              <button
                type="submit"
                disabled={loading || (!content.trim() && images.length === 0)}
                className="flex-1 px-4 py-2.5 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting...
                  </span>
                ) : (
                  'Post'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-4 py-2.5 font-medium text-gray-700 dark:text-zinc-300 transition-colors bg-gray-200 dark:bg-[#1A1A1A] hover:bg-gray-300 dark:hover:bg-[#262626] rounded-lg cursor-pointer"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreatePost;