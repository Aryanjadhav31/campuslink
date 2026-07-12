import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  PencilIcon, 
  EnvelopeIcon, 
  UserGroupIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  BriefcaseIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

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
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // ✅ Social Media Link Configuration
  const socialMediaLinks = [
    { key: 'instagram', icon: FaInstagram, color: 'text-pink-600', bg: 'bg-pink-100', hover: 'hover:bg-pink-200', label: 'Instagram' },
    { key: 'snapchat', icon: FaSnapchat, color: 'text-yellow-600', bg: 'bg-yellow-100', hover: 'hover:bg-yellow-200', label: 'Snapchat' },
    { key: 'twitter', icon: FaTwitter, color: 'text-blue-400', bg: 'bg-blue-100', hover: 'hover:bg-blue-200', label: 'Twitter' },
    { key: 'youtube', icon: FaYoutube, color: 'text-red-600', bg: 'bg-red-100', hover: 'hover:bg-red-200', label: 'YouTube' },
    { key: 'facebook', icon: FaFacebook, color: 'text-blue-600', bg: 'bg-blue-100', hover: 'hover:bg-blue-200', label: 'Facebook' },
    { key: 'discord', icon: FaDiscord, color: 'text-indigo-600', bg: 'bg-indigo-100', hover: 'hover:bg-indigo-200', label: 'Discord' },
    { key: 'telegram', icon: FaTelegram, color: 'text-blue-500', bg: 'bg-blue-100', hover: 'hover:bg-blue-200', label: 'Telegram' },
    { key: 'whatsapp', icon: FaWhatsapp, color: 'text-green-600', bg: 'bg-green-100', hover: 'hover:bg-green-200', label: 'WhatsApp' }
  ];

  // ✅ Professional Links Configuration
  const professionalLinks = [
    { key: 'github', icon: FaGithub, color: 'text-gray-700', bg: 'bg-gray-100', hover: 'hover:bg-gray-200', label: 'GitHub' },
    { key: 'linkedin', icon: FaLinkedin, color: 'text-blue-700', bg: 'bg-blue-100', hover: 'hover:bg-blue-200', label: 'LinkedIn' },
    { key: 'portfolio', icon: GlobeAltIcon, color: 'text-purple-600', bg: 'bg-purple-100', hover: 'hover:bg-purple-200', label: 'Portfolio' }
  ];

  // ✅ Get social links from user
  const getSocialLink = (key) => {
    return user?.socialLinks?.[key] || '';
  };

  // ✅ Check if any social media links exist
  const hasSocialLinks = () => {
    return socialMediaLinks.some(link => getSocialLink(link.key));
  };

  const hasProfessionalLinks = () => {
    return professionalLinks.some(link => getSocialLink(link.key));
  };

  const formatDate = (date) => {
    if (!date) return 'Recent';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <Layout>
        <div className="py-12 text-center">
          <p className="text-gray-500">Please login to view profile</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="overflow-hidden bg-white shadow-sm rounded-xl">
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-600">
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent"></div>
          </div>
          <div className="relative px-6 pb-6">
            <div className="flex flex-col items-start justify-between md:flex-row">
              <div className="flex items-end -mt-12">
                <img
                  src={user?.profileImage || 'https://via.placeholder.com/120'}
                  alt={user?.name}
                  className="object-cover w-24 h-24 border-4 border-white rounded-full shadow-lg"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/120'}
                />
                <div className="ml-4">
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <p className="text-gray-600">{user?.college}</p>
                  <p className="text-sm text-gray-500">{user?.department}, {user?.year} Year</p>
                </div>
              </div>
              <Link
                to="/profile/edit"
                className="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg md:mt-0 hover:bg-gray-200"
              >
                <PencilIcon className="h-4 w-4 mr-1.5" />
                Edit Profile
              </Link>
            </div>

            {/* Bio */}
            {user?.bio && (
              <div className="p-4 mt-4 bg-gray-50 rounded-xl">
                <p className="text-gray-700">{user.bio}</p>
              </div>
            )}

            {/* Looking For */}
            {user?.lookingFor && (
              <div className="flex items-center mt-3">
                <span className="text-sm text-gray-600">Looking for: </span>
                <span className="px-3 py-1 ml-2 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full">
                  {user.lookingFor}
                </span>
              </div>
            )}

            {/* Skills & Interests */}
            <div className="flex flex-wrap gap-2 mt-4">
              {user?.skills?.map((skill, index) => (
                <span key={index} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
              {user?.interests?.map((interest, index) => (
                <span key={index} className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {interest}
                </span>
              ))}
            </div>

            {/* ✅ Professional Links */}
            {hasProfessionalLinks() && (
              <div className="mt-4">
                <h3 className="flex items-center mb-2 text-sm font-semibold text-gray-700">
                  <BriefcaseIcon className="h-4 w-4 mr-1.5" />
                  Professional
                </h3>
                <div className="flex flex-wrap gap-2">
                  {professionalLinks.map((link) => {
                    const url = getSocialLink(link.key);
                    if (!url) return null;
                    return (
                      <a
                        key={link.key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center px-3 py-1.5 ${link.bg} ${link.color} rounded-lg hover:${link.hover} transition-colors text-sm`}
                      >
                        <link.icon className="h-4 w-4 mr-1.5" />
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ✅ Social Media Links */}
            {hasSocialLinks() && (
              <div className="mt-4">
                <h3 className="flex items-center mb-2 text-sm font-semibold text-gray-700">
                  <ShareIcon className="h-4 w-4 mr-1.5" />
                  Connect on Social Media
                </h3>
                <div className="flex flex-wrap gap-2">
                  {socialMediaLinks.map((link) => {
                    const url = getSocialLink(link.key);
                    if (!url) return null;
                    return (
                      <a
                        key={link.key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center px-3 py-1.5 ${link.bg} ${link.color} rounded-lg hover:${link.hover} transition-colors text-sm`}
                      >
                        <link.icon className="h-4 w-4 mr-1.5" />
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 text-center bg-white shadow-sm rounded-xl">
            <div className="text-2xl font-bold text-blue-600">{user?.friends?.length || 0}</div>
            <div className="text-sm text-gray-600">Friends</div>
          </div>
          <div className="p-4 text-center bg-white shadow-sm rounded-xl">
            <div className="text-2xl font-bold text-blue-600">{posts.length}</div>
            <div className="text-sm text-gray-600">Posts</div>
          </div>
          <div className="p-4 text-center bg-white shadow-sm rounded-xl">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Communities</div>
          </div>
        </div>

        {/* User Posts */}
        <div className="mt-6">
          <h3 className="mb-4 text-xl font-bold">My Posts</h3>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center bg-white shadow-sm rounded-xl">
              <div className="mb-4 text-5xl">📝</div>
              <p className="text-gray-500">You haven't posted anything yet</p>
              <Link
                to="/create-post"
                className="inline-block px-4 py-2 mt-4 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Create Your First Post
              </Link>
            </div>
          ) : (
            posts.map(post => (
              <div key={post._id} className="p-6 mb-4 bg-white shadow-sm rounded-xl">
                <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                {post.images && post.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {post.images.map((image, index) => (
                      <img key={index} src={image} alt="Post" className="object-cover rounded-lg max-h-64" />
                    ))}
                  </div>
                )}
                <div className="flex items-center pt-3 mt-4 space-x-4 text-sm text-gray-500 border-t border-gray-100">
                  <span>❤️ {post.likes?.length || 0} Likes</span>
                  <span>💬 {post.comments?.length || 0} Comments</span>
                  <span>📅 {formatDate(post.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;