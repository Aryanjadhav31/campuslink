import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
      const { data } = await axios.get('http://localhost:5000/api/communities');
      
      console.log('📋 Communities response:', data);
      
      // ✅ CRITICAL FIX: Ensure data is an array
      let communitiesArray = [];
      if (Array.isArray(data)) {
        communitiesArray = data;
      } else if (data && typeof data === 'object') {
        // If API returns an object with communities array
        if (Array.isArray(data.communities)) {
          communitiesArray = data.communities;
        } else {
          // Try to extract any array from the object
          const possibleArray = Object.values(data).find(val => Array.isArray(val));
          if (possibleArray) {
            communitiesArray = possibleArray;
          } else {
            console.warn('⚠️ Unexpected data format:', data);
            communitiesArray = [];
          }
        }
      } else {
        console.warn('⚠️ Data is not an array:', data);
        communitiesArray = [];
      }
      
      // ✅ Filter communities where user is a member
      const userCommunities = communitiesArray.filter(community => {
        if (!community || !community.members) return false;
        return community.members.some(m => m._id === user?._id);
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
    
    if (!content.trim() && images.length === 0) {
      toast.error('Please add some content or images');
      return;
    }

    setLoading(true);
    
    try {
      console.log('📤 Creating post...');
      
      // ✅ Upload images one by one
      const imageUrls = [];
      for (const image of images) {
        try {
          const formData = new FormData();
          formData.append('image', image.file);
          
          console.log('📤 Uploading image:', image.file.name);
          const { data } = await axios.post(
            'http://localhost:5000/api/upload/image',
            formData,
            {
              headers: { 
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          
          console.log('✅ Image uploaded:', data.url);
          imageUrls.push(data.url);
        } catch (uploadError) {
          console.error('❌ Image upload failed:', uploadError);
          toast.error(`Failed to upload ${image.file.name}`);
          // Continue with other images
        }
      }

      // ✅ Create post
      const postData = {
        content: content.trim(),
        images: imageUrls,
        community: selectedCommunity || undefined
      };

      console.log('📤 Creating post with data:', postData);
      
      const { data } = await axios.post(
        'http://localhost:5000/api/posts',
        postData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('✅ Post created:', data);
      toast.success('Post created successfully! 🎉');
      
      // Navigate back to dashboard
      setTimeout(() => navigate('/dashboard'), 1000);
      
    } catch (error) {
      console.error('❌ Error creating post:', error);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        toast.error(error.response.data?.message || 'Failed to create post');
      } else if (error.request) {
        console.error('No response received');
        toast.error('Cannot connect to server');
      } else {
        toast.error('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Ensure communities is always an array
  const communitiesArray = Array.isArray(communities) ? communities : [];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="p-6 bg-white shadow-sm rounded-xl">
          <h2 className="mb-6 text-2xl font-bold">Create Post</h2>
          
          <form onSubmit={handleSubmit}>
            {/* User Info */}
            <div className="flex items-center mb-4 space-x-3">
              <img
                src={user?.profileImage || 'https://via.placeholder.com/40'}
                alt={user?.name || 'User'}
                className="object-cover w-10 h-10 border-2 border-gray-100 rounded-full"
                onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
              />
              <div>
                <p className="font-semibold">{user?.name || 'User'}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  {selectedCommunity ? (
                    <span>
                      Posting in{' '}
                      <span className="font-medium text-blue-600">
                        {communitiesArray.find(c => c._id === selectedCommunity)?.name || 'Community'}
                      </span>
                    </span>
                  ) : (
                    <span>Posting publicly</span>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows="4"
              className="w-full px-4 py-3 transition border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4 sm:grid-cols-3">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.preview}
                      alt="Upload"
                      className="object-cover w-full h-32 border border-gray-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute p-1 text-white transition-colors bg-red-600 rounded-full opacity-0 top-1 right-1 hover:bg-red-700 group-hover:opacity-100"
                      disabled={loading}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <label className="cursor-pointer">
                <span className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200">
                  <PhotoIcon className="w-5 h-5 mr-2" />
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
                className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                disabled={loading}
              >
                {selectedCommunity ? (
                  <UsersIcon className="w-5 h-5 mr-2" />
                ) : (
                  <GlobeAltIcon className="w-5 h-5 mr-2" />
                )}
                {selectedCommunity ? 'Community Post' : 'Public Post'}
              </button>

              {showCommunitySelect && (
                <div className="w-full p-2 mt-2 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 max-h-48">
                  {fetchingCommunities ? (
                    <div className="py-4 text-center">
                      <div className="w-6 h-6 mx-auto border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading communities...</p>
                    </div>
                  ) : communitiesArray.length === 0 ? (
                    <p className="py-2 text-sm text-center text-gray-500">
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
                        className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                          !selectedCommunity ? 'bg-blue-50 text-blue-700' : ''
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
                          className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                            selectedCommunity === community._id ? 'bg-blue-50 text-blue-700' : ''
                          }`}
                        >
                          <UsersIcon className="inline w-4 h-4 mr-2" />
                          {community.name}
                          <span className="ml-2 text-xs text-gray-400">
                            ({community.members?.length || 0} members)
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex mt-6 space-x-3">
              <button
                type="submit"
                disabled={loading || (!content.trim() && images.length === 0)}
                className="flex-1 px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="flex-1 px-4 py-2 font-medium text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
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