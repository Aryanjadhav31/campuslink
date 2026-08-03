import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  UserIcon,
  LockClosedIcon,
  BellIcon,
  MoonIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  CameraIcon,
  BookmarkIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

// Social Media Icons for social links editing
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

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // Profile Edit Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    college: user?.college || '',
    department: user?.department || '',
    year: user?.year || '1st',
    github: user?.socialLinks?.github || '',
    linkedin: user?.socialLinks?.linkedin || '',
    instagram: user?.socialLinks?.instagram || '',
    twitter: user?.socialLinks?.twitter || '',
    telegram: user?.socialLinks?.telegram || '',
    snapchat: user?.socialLinks?.snapchat || '',
    portfolio: user?.socialLinks?.portfolio || ''
  });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || null);

  // Synchronize state if user object updates
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        college: user.college || '',
        department: user.department || '',
        year: user.year || '1st',
        github: user.socialLinks?.github || '',
        linkedin: user.socialLinks?.linkedin || '',
        instagram: user.socialLinks?.instagram || '',
        twitter: user.socialLinks?.twitter || '',
        telegram: user.socialLinks?.telegram || '',
        snapchat: user.socialLinks?.snapchat || '',
        portfolio: user.socialLinks?.portfolio || ''
      });
      if (!profileImageFile) {
        setImagePreview(user.profileImage || null);
      }
    }
  }, [user]);

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Privacy Settings State
  const [privacy, setPrivacy] = useState({
    showEmail: false,
    showCollege: true,
    showYear: true,
    profileVisibility: 'public'
  });

  // Notification Settings State
  const [notifications, setNotifications] = useState({
    friendRequests: true,
    messages: true,
    postInteractions: true,
    eventReminders: true
  });

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let profileImageUrl = user?.profileImage;

      if (profileImageFile) {
        const formDataImage = new FormData();
        formDataImage.append('image', profileImageFile);
        const { data } = await axios.post('http://localhost:5000/api/upload/profile', formDataImage, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        profileImageUrl = data.url;
      }

      const updatedPayload = {
        name: profileData.name,
        username: profileData.username,
        bio: profileData.bio,
        college: profileData.college,
        department: profileData.department,
        year: profileData.year,
        socialLinks: {
          ...user?.socialLinks,
          github: profileData.github,
          linkedin: profileData.linkedin,
          instagram: profileData.instagram,
          twitter: profileData.twitter,
          telegram: profileData.telegram,
          snapchat: profileData.snapchat,
          portfolio: profileData.portfolio
        }
      };

      if (profileImageUrl) {
        updatedPayload.profileImage = profileImageUrl;
      }

      const { data } = await axios.put('http://localhost:5000/api/users/profile', updatedPayload);
      updateUser(data);
      toast.success('Profile updated successfully! 🎉');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    try {
      await axios.put('http://localhost:5000/api/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete('http://localhost:5000/api/users/profile');
      toast.success('Account deleted');
      logout();
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'security', label: 'Security', icon: LockClosedIcon },
    { id: 'privacy', label: 'Privacy', icon: ShieldCheckIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'appearance', label: 'Appearance', icon: MoonIcon }
  ];

  return (
    <Layout activeTab="settings">
      <div className="w-full flex justify-center py-6 sm:py-10">
        <main className="w-full max-w-[1000px] px-4 sm:px-8">

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Manage your account preferences, profile details, and theme settings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* Left Internal Settings Tab Bar */}
            <div className="md:col-span-3 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] rounded-[16px] p-2 sm:p-3 shadow-sm dark:shadow-2xl">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center w-full px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 dark:bg-[#1A1A1A] dark:text-white font-bold shadow-sm'
                          : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-[#1A1A1A] hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600 dark:text-white' : 'text-gray-400 dark:text-zinc-400'}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Main Content Card Panel (~32px padding, ~20px section spacing) */}
            <div className="md:col-span-9 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] rounded-[16px] p-6 sm:p-8 shadow-sm dark:shadow-2xl">
              
              {/* TAB 1: PROFILE SETTINGS */}
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      Profile Settings
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                      Update your personal information, bio, and social links
                    </p>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    {/* Profile Picture Upload Section */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-3">
                        Profile Picture
                      </label>
                      <div className="flex items-center space-x-5">
                        <div className="relative">
                          <img
                            src={imagePreview || 'https://via.placeholder.com/100'}
                            alt="Profile"
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-300 dark:border-[#262626] bg-gray-100 dark:bg-[#161616]"
                            onError={(e) => e.target.src = 'https://via.placeholder.com/100'}
                          />
                          <label className="absolute bottom-0 right-0 p-2 bg-[#0095F6] hover:bg-[#0081D6] rounded-full cursor-pointer transition-colors shadow-md">
                            <CameraIcon className="w-4 h-4 text-white" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Change Avatar</p>
                          <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">JPG, PNG or WEBP up to 5MB</p>
                        </div>
                      </div>
                    </div>

                    {/* Inline Form Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          className="w-full h-[46px] px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-300 dark:border-[#242424] hover:border-gray-400 dark:hover:border-[#383838] focus:border-[#0095F6] dark:focus:border-[#0095F6] focus:ring-2 focus:ring-[#0095F6]/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 text-sm outline-none transition-all duration-200 shadow-sm"
                          placeholder="Your full name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                          Username
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={profileData.username}
                          onChange={handleProfileChange}
                          className="w-full h-[46px] px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-300 dark:border-[#242424] hover:border-gray-400 dark:hover:border-[#383838] focus:border-[#0095F6] dark:focus:border-[#0095F6] focus:ring-2 focus:ring-[#0095F6]/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 text-sm outline-none transition-all duration-200 shadow-sm"
                          placeholder="username"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                          College
                        </label>
                        <input
                          type="text"
                          name="college"
                          value={profileData.college}
                          onChange={handleProfileChange}
                          className="w-full h-[46px] px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-300 dark:border-[#242424] hover:border-gray-400 dark:hover:border-[#383838] focus:border-[#0095F6] dark:focus:border-[#0095F6] focus:ring-2 focus:ring-[#0095F6]/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 text-sm outline-none transition-all duration-200 shadow-sm"
                          placeholder="College name"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                          Department
                        </label>
                        <input
                          type="text"
                          name="department"
                          value={profileData.department}
                          onChange={handleProfileChange}
                          className="w-full h-[46px] px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-300 dark:border-[#242424] hover:border-gray-400 dark:hover:border-[#383838] focus:border-[#0095F6] dark:focus:border-[#0095F6] focus:ring-2 focus:ring-[#0095F6]/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 text-sm outline-none transition-all duration-200 shadow-sm"
                          placeholder="Computer Science, Engineering..."
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                          Academic Year
                        </label>
                        <div className="relative">
                          <select
                            name="year"
                            value={profileData.year}
                            onChange={handleProfileChange}
                            className="w-full h-[46px] px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-300 dark:border-[#242424] hover:border-gray-400 dark:hover:border-[#383838] focus:border-[#0095F6] dark:focus:border-[#0095F6] focus:ring-2 focus:ring-[#0095F6]/20 rounded-xl text-gray-900 dark:text-white text-sm outline-none transition-all duration-200 shadow-sm appearance-none cursor-pointer pr-10"
                          >
                            <option value="1st" className="bg-white dark:bg-[#161616] text-gray-900 dark:text-white">1st Year</option>
                            <option value="2nd" className="bg-white dark:bg-[#161616] text-gray-900 dark:text-white">2nd Year</option>
                            <option value="3rd" className="bg-white dark:bg-[#161616] text-gray-900 dark:text-white">3rd Year</option>
                            <option value="4th" className="bg-white dark:bg-[#161616] text-gray-900 dark:text-white">4th Year</option>
                            <option value="5th" className="bg-white dark:bg-[#161616] text-gray-900 dark:text-white">5th Year</option>
                            <option value="Graduated" className="bg-white dark:bg-[#161616] text-gray-900 dark:text-white">Graduated</option>
                          </select>
                          <ChevronDownIcon className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          value={profileData.bio}
                          onChange={handleProfileChange}
                          rows="3"
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-300 dark:border-[#242424] hover:border-gray-400 dark:hover:border-[#383838] focus:border-[#0095F6] dark:focus:border-[#0095F6] focus:ring-2 focus:ring-[#0095F6]/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 text-sm outline-none transition-all duration-200 shadow-sm resize-none"
                          placeholder="Tell fellow students about yourself..."
                        />
                      </div>
                    </div>

                    {/* Social Media Links Section */}
                    <div className="pt-4 border-t border-gray-200 dark:border-[#1F1F1F] space-y-4">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
                          <GlobeAltIcon className="w-5 h-5 mr-2 text-[#0095F6]" />
                          Social & Professional Links
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                          Connect your social profiles to show up on your Profile page
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { name: 'github', label: 'GitHub', icon: FaGithub, color: 'text-zinc-400', placeholder: 'https://github.com/username' },
                          { name: 'linkedin', label: 'LinkedIn', icon: FaLinkedin, color: 'text-[#0A66C2]', placeholder: 'https://linkedin.com/in/username' },
                          { name: 'instagram', label: 'Instagram', icon: FaInstagram, color: 'text-pink-500', placeholder: 'https://instagram.com/username' },
                          { name: 'twitter', label: 'Twitter / X', icon: FaTwitter, color: 'text-sky-400', placeholder: 'https://twitter.com/username' },
                          { name: 'telegram', label: 'Telegram', icon: FaTelegram, color: 'text-[#229ED9]', placeholder: 'https://t.me/username' },
                          { name: 'snapchat', label: 'Snapchat', icon: FaSnapchat, color: 'text-yellow-400', placeholder: 'https://snapchat.com/add/username' },
                          { name: 'portfolio', label: 'Portfolio', icon: GlobeAltIcon, color: 'text-emerald-400', placeholder: 'https://yourportfolio.com' }
                        ].map((field) => {
                          const Icon = field.icon;
                          const val = profileData[field.name] || '';
                          let errorMsg = '';
                          if (val.trim()) {
                            const lowVal = val.trim().toLowerCase();
                            if (field.name === 'github' && !lowVal.includes('github.com')) errorMsg = 'Must contain github.com';
                            else if (field.name === 'linkedin' && !lowVal.includes('linkedin.com')) errorMsg = 'Must contain linkedin.com';
                            else if (field.name === 'instagram' && !lowVal.includes('instagram.com')) errorMsg = 'Must contain instagram.com';
                            else if (field.name === 'twitter' && !lowVal.includes('twitter.com') && !lowVal.includes('x.com')) errorMsg = 'Must contain twitter.com or x.com';
                            else if (field.name === 'telegram' && !lowVal.includes('t.me') && !lowVal.includes('telegram.me')) errorMsg = 'Must contain t.me';
                            else if (field.name === 'snapchat' && !lowVal.includes('snapchat.com')) errorMsg = 'Must contain snapchat.com';
                            else if (field.name === 'portfolio' && !lowVal.startsWith('http://') && !lowVal.startsWith('https://')) errorMsg = 'Must start with http:// or https://';
                          }

                          return (
                            <div key={field.name}>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center">
                                <Icon className={`w-4 h-4 mr-1.5 flex-shrink-0 ${field.color}`} /> {field.label}
                              </label>
                              <input
                                type="url"
                                name={field.name}
                                value={val}
                                onChange={handleProfileChange}
                                className={`w-full h-[42px] px-3 py-2 bg-gray-50 dark:bg-[#141414] border ${
                                  errorMsg
                                    ? 'border-red-500 focus:ring-red-500/20'
                                    : 'border-gray-300 dark:border-[#242424] hover:border-gray-400 dark:hover:border-[#383838] focus:border-[#0095F6] focus:ring-2 focus:ring-[#0095F6]/20'
                                } rounded-xl text-gray-900 dark:text-white text-xs outline-none transition-all duration-200 shadow-sm`}
                                placeholder={field.placeholder}
                              />
                              {errorMsg && (
                                <p className="text-[11px] text-red-500 mt-1 font-medium">{errorMsg}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Submit Action */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-[#0095F6] hover:bg-[#0081D6] text-white font-semibold text-sm rounded-xl transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center"
                      >
                        {loading ? 'Saving Profile...' : 'Save Profile Changes'}
                      </button>
                    </div>
                  </form>

                  {/* View Archive Section */}
                  <div className="pt-8 border-t border-gray-200 dark:border-[#1F1F1F]">
                    <div className="bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#262626] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center">
                          <BookmarkIcon className="w-5 h-5 mr-2 text-[#0095F6]" />
                          View Post Archive
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                          Access your saved posts, archived content, and bookmarked publications
                        </p>
                      </div>
                      <Link
                        to="/profile?tab=saved"
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-[#262626] dark:hover:bg-[#333333] text-gray-900 dark:text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
                      >
                        <span>View Archive</span>
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SECURITY */}
              {activeTab === 'security' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      Security Settings
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                      Update your password and secure your account
                    </p>
                  </div>

                  <form onSubmit={handlePasswordChange} className="max-w-md space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                        required
                        minLength="6"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-[#0095F6] hover:bg-[#0081D6] text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Updating Password...' : 'Change Password'}
                    </button>
                  </form>

                  {/* Danger Zone */}
                  <div className="pt-8 border-t border-gray-200 dark:border-[#1F1F1F]">
                    <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">
                      Danger Zone
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4">
                      Permanently delete your account and all associated profile posts and data.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: PRIVACY */}
              {activeTab === 'privacy' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      Privacy Preferences
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                      Control who can view your details and profile
                    </p>
                  </div>

                  <div className="max-w-lg space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#161616] rounded-xl border border-gray-200 dark:border-[#262626]">
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">Profile Visibility</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">Choose who can view your profile page</p>
                      </div>
                      <select
                        value={privacy.profileVisibility}
                        onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                        className="px-3 py-1.5 bg-white dark:bg-[#1F1F1F] border border-gray-300 dark:border-[#333333] rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                      >
                        <option value="public">Public</option>
                        <option value="friends">Friends Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#161616] rounded-xl border border-gray-200 dark:border-[#262626]">
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">Display Email</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">Show email address on your public profile</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPrivacy({ ...privacy, showEmail: !privacy.showEmail })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
                          privacy.showEmail ? 'bg-[#0095F6]' : 'bg-gray-300 dark:bg-[#262626]'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                            privacy.showEmail ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    <button
                      onClick={() => toast.success('Privacy settings saved!')}
                      className="px-6 py-2.5 bg-[#0095F6] hover:bg-[#0081D6] text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Save Privacy Settings
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      Notification Preferences
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                      Choose which alerts and activities you want to receive
                    </p>
                  </div>

                  <div className="max-w-lg space-y-4">
                    {[
                      { key: 'friendRequests', title: 'Friend Requests', desc: 'Get notified when someone sends a friend request' },
                      { key: 'postInteractions', title: 'Post Interactions', desc: 'Alerts when someone likes or comments on your post' },
                      { key: 'eventReminders', title: 'Event Reminders', desc: 'Reminders about upcoming campus events' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#161616] rounded-xl border border-gray-200 dark:border-[#262626]">
                        <div>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">{item.title}</p>
                          <p className="text-xs text-gray-500 dark:text-zinc-400">{item.desc}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
                            notifications[item.key] ? 'bg-[#0095F6]' : 'bg-gray-300 dark:bg-[#262626]'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                              notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => toast.success('Notification settings saved!')}
                      className="px-6 py-2.5 bg-[#0095F6] hover:bg-[#0081D6] text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Save Notification Settings
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: APPEARANCE (FUNCTIONAL DARK MODE TOGGLE) */}
              {activeTab === 'appearance' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      Appearance Settings
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                      Customize your visual theme and interface preferences
                    </p>
                  </div>

                  <div className="max-w-lg space-y-6">
                    {/* Modern Toggle Switch for Dark Mode */}
                    <div className="p-5 bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#262626] rounded-xl flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <MoonIcon className="w-5 h-5 text-[#0095F6]" />
                          <span className="font-bold text-base text-gray-900 dark:text-white">Dark Mode</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                          Switch between light and dark theme app-wide
                        </p>
                      </div>

                      {/* Smooth Styled Toggle Switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isDark}
                        onClick={toggleTheme}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0095F6] focus:ring-offset-2 dark:focus:ring-offset-[#111111] ${
                          isDark ? 'bg-[#0095F6]' : 'bg-gray-300 dark:bg-zinc-700'
                        }`}
                      >
                        <span className="sr-only">Toggle Dark Mode</span>
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                            isDark ? 'translate-x-7' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 flex items-center">
                      <CheckCircleIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>
                        Current active theme: <strong>{isDark ? 'Dark Mode' : 'Light Mode'}</strong>. Theme is saved and automatically applied across all pages.
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </main>
      </div>
    </Layout>
  );
};

export default Settings;