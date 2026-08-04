import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  UserIcon,
  LockClosedIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
  ShieldCheckIcon,
  CameraIcon,
  BookmarkIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
  GlobeAltIcon
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
  const { isDark, toggleTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  const initialTab = searchParams.get('tab') || location.state?.activeTab || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Tab Loading States
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingAppearance, setSavingAppearance] = useState(false);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') || location.state?.activeTab;
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, location.state]);

  // 1. Profile Edit Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    college: user?.college || '',
    department: user?.department || '',
    year: user?.year || '1st',
    location: user?.location || '',
    skills: Array.isArray(user?.skills) ? user.skills.join(', ') : (user?.skills || ''),
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

  // 2. Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 3. Privacy Settings State
  const [privacy, setPrivacy] = useState({
    profileVisibility: user?.settings?.privacy?.profileVisibility || 'public',
    showEmail: user?.settings?.privacy?.showEmail !== false
  });

  // 4. Notification Settings State
  const [notifications, setNotifications] = useState({
    email: user?.settings?.notifications?.email !== false,
    push: user?.settings?.notifications?.push !== false,
    friendRequests: user?.settings?.notifications?.friendRequests !== false,
    messages: user?.settings?.notifications?.messages !== false,
    likes: user?.settings?.notifications?.likes !== false,
    comments: user?.settings?.notifications?.comments !== false,
    communityUpdates: user?.settings?.notifications?.communityUpdates !== false,
    eventNotifications: user?.settings?.notifications?.eventNotifications !== false
  });

  // 5. Appearance Settings State
  const [selectedTheme, setSelectedTheme] = useState(user?.settings?.appearance?.theme || (isDark ? 'dark' : 'light'));

  // Synchronize component states when AuthContext user updates
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        college: user.college || '',
        department: user.department || '',
        year: user.year || '1st',
        location: user.location || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
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
      if (user.settings?.privacy) {
        setPrivacy({
          profileVisibility: user.settings.privacy.profileVisibility || 'public',
          showEmail: user.settings.privacy.showEmail !== false
        });
      }
      if (user.settings?.notifications) {
        setNotifications({
          email: user.settings.notifications.email !== false,
          push: user.settings.notifications.push !== false,
          friendRequests: user.settings.notifications.friendRequests !== false,
          messages: user.settings.notifications.messages !== false,
          likes: user.settings.notifications.likes !== false,
          comments: user.settings.notifications.comments !== false,
          communityUpdates: user.settings.notifications.communityUpdates !== false,
          eventNotifications: user.settings.notifications.eventNotifications !== false
        });
      }
      if (user.settings?.appearance?.theme) {
        setSelectedTheme(user.settings.appearance.theme);
      }
    }
  }, [user]);

  // Handlers
  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be under 5MB');
        return;
      }
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit Profile Form
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      let profileImageUrl = user?.profileImage;

      if (profileImageFile) {
        const formDataImage = new FormData();
        formDataImage.append('image', profileImageFile);
        const { data: uploadData } = await axios.post('http://localhost:5000/api/upload/profile', formDataImage, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        profileImageUrl = uploadData.url;
      }

      const updatedPayload = {
        name: profileData.name,
        username: profileData.username,
        bio: profileData.bio,
        college: profileData.college,
        department: profileData.department,
        year: profileData.year,
        location: profileData.location,
        skills: profileData.skills,
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
      setSavingProfile(false);
    }
  };

  // Submit Password Form
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    setSavingPassword(true);

    try {
      const { data } = await axios.put('http://localhost:5000/api/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      toast.success(data.message || 'Password changed successfully! 🎉');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  // Submit Privacy Settings
  const handlePrivacySubmit = async (e) => {
    e.preventDefault();
    setSavingPrivacy(true);

    try {
      const { data } = await axios.put('http://localhost:5000/api/users/settings/privacy', privacy);
      updateUser(data);
      toast.success('Privacy preferences saved successfully! 🔒');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save privacy settings');
    } finally {
      setSavingPrivacy(false);
    }
  };

  // Submit Notification Settings
  const handleNotificationsSubmit = async (e) => {
    e.preventDefault();
    setSavingNotifications(true);

    try {
      const { data } = await axios.put('http://localhost:5000/api/users/settings/notifications', notifications);
      updateUser(data);
      toast.success('Notification preferences saved! 🔔');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save notification preferences');
    } finally {
      setSavingNotifications(false);
    }
  };

  // Submit Appearance Settings
  const handleAppearanceSubmit = async (themeChoice) => {
    const targetTheme = themeChoice || selectedTheme;
    setSelectedTheme(targetTheme);
    setSavingAppearance(true);

    try {
      const { data } = await axios.put('http://localhost:5000/api/users/settings/appearance', { theme: targetTheme });
      updateUser(data);
      setTheme(targetTheme === 'system' ? 'dark' : targetTheme);
      toast.success(`Theme updated to ${targetTheme.toUpperCase()}! 🎨`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save theme settings');
    } finally {
      setSavingAppearance(false);
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
    { id: 'notifications', label: 'Notifications', icon: BellIcon }
  ];

  return (
    <Layout activeTab="settings">
      <div className="w-full flex justify-center py-6 sm:py-10">
        <main className="w-full max-w-[1000px] px-4 sm:px-8">

          {/* Header Title */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Manage your profile details, security preferences, privacy, and theme
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* Left Sidebar Tabs */}
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

            {/* Main Tab Content */}
            <div className="md:col-span-9 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] rounded-[16px] p-6 sm:p-8 shadow-sm dark:shadow-2xl">
              
              {/* TAB 1: PROFILE SETTINGS */}
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      Profile Settings
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                      Update your avatar, username, academic details, and portfolio
                    </p>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    
                    {/* Avatar Upload */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
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
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Change Profile Picture</p>
                          <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">JPG, PNG or WEBP (Max 5MB)</p>
                        </div>
                      </div>
                    </div>

                    {/* Form Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          className="w-full h-[46px] px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-300 dark:border-[#242424] hover:border-gray-400 dark:hover:border-[#383838] focus:border-[#0095F6] focus:ring-2 focus:ring-[#0095F6]/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 text-sm outline-none transition-all"
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
                          className="w-full h-[46px] px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-300 dark:border-[#242424] hover:border-gray-400 dark:hover:border-[#383838] focus:border-[#0095F6] focus:ring-2 focus:ring-[#0095F6]/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 text-sm outline-none transition-all"
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
                          className="w-full h-[46px] px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-300 dark:border-[#242424] hover:border-gray-400 dark:hover:border-[#383838] focus:border-[#0095F6] focus:ring-2 focus:ring-[#0095F6]/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 text-sm outline-none transition-all"
                          placeholder="Campus name"
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
                          className="w-full h-[46px] px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-300 dark:border-[#242424] hover:border-gray-400 dark:hover:border-[#383838] focus:border-[#0095F6] focus:ring-2 focus:ring-[#0095F6]/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 text-sm outline-none transition-all"
                          placeholder="Computer Science, IT..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                          Academic Year
                        </label>
                        <div className="relative">
                          <select
                            name="year"
                            value={profileData.year}
                            onChange={handleProfileChange}
                            className="w-full h-[46px] px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-300 dark:border-[#242424] hover:border-gray-400 dark:hover:border-[#383838] focus:border-[#0095F6] focus:ring-2 focus:ring-[#0095F6]/20 rounded-xl text-gray-900 dark:text-white text-sm outline-none transition-all appearance-none cursor-pointer pr-10"
                          >
                            <option value="1st">1st Year</option>
                            <option value="2nd">2nd Year</option>
                            <option value="3rd">3rd Year</option>
                            <option value="4th">4th Year</option>
                            <option value="5th">5th Year</option>
                            <option value="Graduated">Graduated</option>
                          </select>
                          <ChevronDownIcon className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                          Location
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={profileData.location}
                          onChange={handleProfileChange}
                          className="w-full h-[46px] px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-300 dark:border-[#242424] hover:border-gray-400 dark:hover:border-[#383838] focus:border-[#0095F6] focus:ring-2 focus:ring-[#0095F6]/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 text-sm outline-none transition-all"
                          placeholder="City, Country"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                          Skills (Comma Separated)
                        </label>
                        <input
                          type="text"
                          name="skills"
                          value={profileData.skills}
                          onChange={handleProfileChange}
                          className="w-full h-[46px] px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-300 dark:border-[#242424] hover:border-gray-400 dark:hover:border-[#383838] focus:border-[#0095F6] focus:ring-2 focus:ring-[#0095F6]/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 text-sm outline-none transition-all"
                          placeholder="React, Node.js, Python, Figma"
                        />
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
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-300 dark:border-[#242424] hover:border-gray-400 dark:hover:border-[#383838] focus:border-[#0095F6] focus:ring-2 focus:ring-[#0095F6]/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 text-sm outline-none transition-all resize-none"
                          placeholder="Tell fellow students about yourself..."
                        />
                      </div>
                    </div>

                    {/* Social Media Section */}
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
                                className="w-full h-[42px] px-3 py-2 bg-gray-50 dark:bg-[#141414] border border-gray-300 dark:border-[#242424] hover:border-gray-400 dark:hover:border-[#383838] focus:border-[#0095F6] focus:ring-2 focus:ring-[#0095F6]/20 rounded-xl text-gray-900 dark:text-white text-xs outline-none transition-all"
                                placeholder={field.placeholder}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Submit Action */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-6 py-2.5 bg-[#0095F6] hover:bg-[#0081D6] text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                      >
                        {savingProfile && (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        )}
                        <span>{savingProfile ? 'Saving Profile...' : 'Save Profile Changes'}</span>
                      </button>
                    </div>
                  </form>
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
                      Update your password securely with bcrypt verification
                    </p>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                        Current Password *
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#141414] border border-gray-300 dark:border-[#242424] rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                        New Password *
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#141414] border border-gray-300 dark:border-[#242424] rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                        required
                        minLength="6"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                        Confirm New Password *
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#141414] border border-gray-300 dark:border-[#242424] rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={savingPassword}
                      className="px-6 py-2.5 bg-[#0095F6] hover:bg-[#0081D6] text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                    >
                      {savingPassword && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      )}
                      <span>{savingPassword ? 'Updating Password...' : 'Save Password'}</span>
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
                      Control who can view your profile details and email address
                    </p>
                  </div>

                  <form onSubmit={handlePrivacySubmit} className="max-w-lg space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-[#242424]">
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">Profile Visibility</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">Control who can access your profile page</p>
                      </div>
                      <select
                        value={privacy.profileVisibility}
                        onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                        className="px-3 py-2 bg-white dark:bg-[#1F1F1F] border border-gray-300 dark:border-[#333333] rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0095F6] cursor-pointer"
                      >
                        <option value="public">Public</option>
                        <option value="friends">Friends Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-[#242424]">
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">Display Email</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">Show email address on your public profile page</p>
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
                      type="submit"
                      disabled={savingPrivacy}
                      className="px-6 py-2.5 bg-[#0095F6] hover:bg-[#0081D6] text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                    >
                      {savingPrivacy && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      )}
                      <span>{savingPrivacy ? 'Saving Privacy...' : 'Save Privacy Settings'}</span>
                    </button>
                  </form>
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
                      Choose which events and activities trigger notifications
                    </p>
                  </div>

                  <form onSubmit={handleNotificationsSubmit} className="max-w-lg space-y-4">
                    {[
                      { key: 'email', title: 'Email Notifications', desc: 'Receive email alerts for important updates' },
                      { key: 'push', title: 'Push Notifications', desc: 'Receive browser push notifications' },
                      { key: 'friendRequests', title: 'Friend Requests', desc: 'Get notified when someone sends a friend request' },
                      { key: 'messages', title: 'Direct Messages', desc: 'Alerts for incoming chat messages' },
                      { key: 'likes', title: 'Post Likes', desc: 'Get notified when someone likes your post' },
                      { key: 'comments', title: 'Post Comments', desc: 'Alerts when someone comments on your post' },
                      { key: 'communityUpdates', title: 'Community Updates', desc: 'Notifications from joined communities' },
                      { key: 'eventNotifications', title: 'Event Reminders', desc: 'Reminders about upcoming campus events' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-[#242424]">
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
                      type="submit"
                      disabled={savingNotifications}
                      className="px-6 py-2.5 bg-[#0095F6] hover:bg-[#0081D6] text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                    >
                      {savingNotifications && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      )}
                      <span>{savingNotifications ? 'Saving Preferences...' : 'Save Notification Preferences'}</span>
                    </button>
                  </form>
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