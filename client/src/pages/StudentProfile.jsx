import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  UserPlusIcon,
  UserMinusIcon,
  ChatBubbleLeftIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

// ✅ Add these imports
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

  // ✅ Add social media link configurations
  const socialMediaLinks = [
    { key: 'instagram', icon: FaInstagram, color: 'text-pink-600', bg: 'bg-pink-100', label: 'Instagram' },
    { key: 'snapchat', icon: FaSnapchat, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Snapchat' },
    { key: 'twitter', icon: FaTwitter, color: 'text-blue-400', bg: 'bg-blue-100', label: 'Twitter' },
    { key: 'youtube', icon: FaYoutube, color: 'text-red-600', bg: 'bg-red-100', label: 'YouTube' },
    { key: 'facebook', icon: FaFacebook, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Facebook' },
    { key: 'discord', icon: FaDiscord, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Discord' },
    { key: 'telegram', icon: FaTelegram, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Telegram' },
    { key: 'whatsapp', icon: FaWhatsapp, color: 'text-green-600', bg: 'bg-green-100', label: 'WhatsApp' }
  ];

  const professionalLinks = [
    { key: 'github', icon: FaGithub, color: 'text-gray-700', bg: 'bg-gray-100', label: 'GitHub' },
    { key: 'linkedin', icon: FaLinkedin, color: 'text-blue-700', bg: 'bg-blue-100', label: 'LinkedIn' },
    { key: 'portfolio', icon: GlobeAltIcon, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Portfolio' }
  ];

  useEffect(() => {
    fetchUserData();
    fetchFriendRequests();
  }, [id]);

  const fetchUserData = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/users/${id}`);
      setProfileUser(data);
      
      const isFriend = user?.friends?.some(f => f._id === id);
      setIsFriend(isFriend);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Failed to load profile');
      navigate('/students');
    } finally {
      setLoading(false);
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

  // ✅ Helper functions for social links
  const getSocialLink = (key) => {
    return profileUser?.socialLinks?.[key] || '';
  };

  const hasSocialLinks = () => {
    return socialMediaLinks.some(link => getSocialLink(link.key));
  };

  const hasProfessionalLinks = () => {
    return professionalLinks.some(link => getSocialLink(link.key));
  };

  const isOnline = onlineUsers.includes(id);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (!profileUser) {
    return (
      <Layout>
        <div className="py-12 text-center">
          <p className="text-gray-500">User not found</p>
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
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="overflow-hidden bg-white shadow-sm rounded-xl">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <div className="relative px-6 pb-6">
            <div className="flex flex-col items-start justify-between md:flex-row">
              <div className="flex items-end -mt-12">
                <img
                  src={profileUser.profileImage || 'https://via.placeholder.com/120'}
                  alt={profileUser.name}
                  className="object-cover w-24 h-24 border-4 border-white rounded-full shadow-lg"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/120'}
                />
                <div className="ml-4">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-bold">{profileUser.name}</h2>
                    {isOnline && (
                      <span className="flex items-center px-2 py-1 text-xs text-white bg-green-500 rounded-full">
                        <span className="h-1.5 w-1.5 bg-white rounded-full mr-1"></span>
                        Online
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{profileUser.college}</p>
                  <p className="text-sm text-gray-500">{profileUser.department}, {profileUser.year} Year</p>
                </div>
              </div>

              {/* Action Buttons */}
              {!isOwnProfile && (
                <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                  {isFriend ? (
                    <>
                      <button
                        onClick={() => navigate(`/chat/${id}`)}
                        className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        <ChatBubbleLeftIcon className="w-5 h-5 mr-1" />
                        Message
                      </button>
                      <button
                        onClick={handleRemoveFriend}
                        className="flex items-center px-4 py-2 text-red-700 transition-colors bg-red-100 rounded-lg hover:bg-red-200"
                      >
                        <UserMinusIcon className="w-5 h-5 mr-1" />
                        Remove
                      </button>
                    </>
                  ) : isPending || isFriendRequestSent ? (
                    <button
                      disabled
                      className="px-4 py-2 text-gray-600 bg-gray-300 rounded-lg cursor-not-allowed"
                    >
                      Request Pending
                    </button>
                  ) : friendRequestStatus === 'pending' ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAcceptRequest}
                        className="flex items-center px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                      >
                        <CheckCircleIcon className="w-5 h-5 mr-1" />
                        Accept
                      </button>
                      <button
                        onClick={handleRejectRequest}
                        className="flex items-center px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                      >
                        <XCircleIcon className="w-5 h-5 mr-1" />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleSendFriendRequest}
                      className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <UserPlusIcon className="w-5 h-5 mr-1" />
                      Add Friend
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bio */}
            {profileUser.bio && (
              <div className="p-4 mt-4 bg-gray-50 rounded-xl">
                <p className="text-gray-700">{profileUser.bio}</p>
              </div>
            )}

            {/* Looking For */}
            {profileUser.lookingFor && (
              <div className="flex items-center mt-3">
                <span className="text-sm text-gray-600">Looking for: </span>
                <span className="px-3 py-1 ml-2 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full">
                  {profileUser.lookingFor}
                </span>
              </div>
            )}

            {/* Skills & Interests */}
            <div className="flex flex-wrap gap-2 mt-4">
              {profileUser.skills?.map((skill, index) => (
                <span key={index} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
              {profileUser.interests?.map((interest, index) => (
                <span key={index} className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {interest}
                </span>
              ))}
            </div>

            {/* ✅ Professional Links Section */}
            {hasProfessionalLinks() && (
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Professional</h3>
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
                        className={`inline-flex items-center px-3 py-1.5 ${link.bg} ${link.color} rounded-lg hover:opacity-80 transition-opacity text-sm`}
                      >
                        <link.icon className="h-4 w-4 mr-1.5" />
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ✅ Social Media Links Section */}
            {hasSocialLinks() && (
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Connect on Social Media</h3>
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
                        className={`inline-flex items-center px-3 py-1.5 ${link.bg} ${link.color} rounded-lg hover:opacity-80 transition-opacity text-sm`}
                      >
                        <link.icon className="h-4 w-4 mr-1.5" />
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Original Social Links (keeping for backward compatibility) */}
            <div className="flex flex-wrap gap-4 mt-4">
              {profileUser.socialLinks?.github && (
                <a
                  href={profileUser.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-gray-600 transition-colors hover:text-gray-900"
                >
                  <GlobeAltIcon className="w-4 h-4 mr-1" />
                  GitHub
                </a>
              )}
              {profileUser.socialLinks?.linkedin && (
                <a
                  href={profileUser.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-gray-600 transition-colors hover:text-gray-900"
                >
                  <GlobeAltIcon className="w-4 h-4 mr-1" />
                  LinkedIn
                </a>
              )}
              {profileUser.socialLinks?.portfolio && (
                <a
                  href={profileUser.socialLinks.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-gray-600 transition-colors hover:text-gray-900"
                >
                  <GlobeAltIcon className="w-4 h-4 mr-1" />
                  Portfolio
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 text-center bg-white shadow-sm rounded-xl">
            <div className="text-2xl font-bold text-blue-600">{profileUser.friends?.length || 0}</div>
            <div className="text-sm text-gray-600">Friends</div>
          </div>
          <div className="p-4 text-center bg-white shadow-sm rounded-xl">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Posts</div>
          </div>
          <div className="p-4 text-center bg-white shadow-sm rounded-xl">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Communities</div>
          </div>
        </div>

        {/* Mutual Friends */}
        {isFriend && (
          <div className="p-6 mt-6 bg-white shadow-sm rounded-xl">
            <h3 className="mb-3 text-lg font-semibold">Mutual Friends</h3>
            <div className="flex flex-wrap gap-2">
              {profileUser.friends?.filter(f => 
                user?.friends?.some(uf => uf._id === f._id)
              ).length === 0 ? (
                <p className="text-sm text-gray-500">No mutual friends</p>
              ) : (
                profileUser.friends?.filter(f => 
                  user?.friends?.some(uf => uf._id === f._id)
                ).map(friend => (
                  <Link
                    key={friend._id}
                    to={`/students/${friend._id}`}
                    className="flex items-center px-3 py-2 space-x-2 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <img
                      src={friend.profileImage || 'https://via.placeholder.com/32'}
                      alt={friend.name}
                      className="object-cover w-8 h-8 rounded-full"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/32'}
                    />
                    <span className="text-sm font-medium">{friend.name}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentProfile;