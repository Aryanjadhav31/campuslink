import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  CameraIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

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

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    college: user?.college || '',
    department: user?.department || '',
    year: user?.year || '1st',
    lookingFor: user?.lookingFor || 'Networking',
    skills: user?.skills?.join(', ') || '',
    interests: user?.interests?.join(', ') || '',

    // ✅ Professional Links
    github: user?.socialLinks?.github || '',
    linkedin: user?.socialLinks?.linkedin || '',
    portfolio: user?.socialLinks?.portfolio || '',

    // ✅ New Social Media Links
    instagram: user?.socialLinks?.instagram || '',
    snapchat: user?.socialLinks?.snapchat || '',
    twitter: user?.socialLinks?.twitter || '',
    youtube: user?.socialLinks?.youtube || '',
    facebook: user?.socialLinks?.facebook || '',
    discord: user?.socialLinks?.discord || '',
    telegram: user?.socialLinks?.telegram || '',
    whatsapp: user?.socialLinks?.whatsapp || ''
  });

  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let profileImageUrl = user?.profileImage;

      if (profileImage) {
        const formDataImage = new FormData();
        formDataImage.append('image', profileImage);
        const { data } = await axios.post('http://localhost:5000/api/upload/profile', formDataImage, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        profileImageUrl = data.url;
      }

      const updatedData = {
        name: formData.name,
        bio: formData.bio,
        college: formData.college,
        department: formData.department,
        year: formData.year,
        lookingFor: formData.lookingFor,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean),
        socialLinks: {
          // Professional
          github: formData.github,
          linkedin: formData.linkedin,
          portfolio: formData.portfolio,
          // Social Media
          instagram: formData.instagram,
          snapchat: formData.snapchat,
          twitter: formData.twitter,
          youtube: formData.youtube,
          facebook: formData.facebook,
          discord: formData.discord,
          telegram: formData.telegram,
          whatsapp: formData.whatsapp
        }
      };

      if (profileImageUrl) {
        updatedData.profileImage = profileImageUrl;
      }

      const { data } = await axios.put('http://localhost:5000/api/users/profile', updatedData);
      updateUser(data);
      toast.success('Profile updated successfully! 🎉');
      navigate('/profile');
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Social Media Input Configurations
  const socialMediaFields = [
    {
      name: 'instagram',
      label: 'Instagram',
      icon: FaInstagram,
      placeholder: 'https://instagram.com/username',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      focusColor: 'focus:ring-pink-500'
    },
    {
      name: 'snapchat',
      label: 'Snapchat',
      icon: FaSnapchat,
      placeholder: 'https://snapchat.com/add/username',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      focusColor: 'focus:ring-yellow-500'
    },
    {
      name: 'twitter',
      label: 'Twitter / X',
      icon: FaTwitter,
      placeholder: 'https://twitter.com/username',
      color: 'text-blue-400',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      focusColor: 'focus:ring-blue-400'
    },
    {
      name: 'youtube',
      label: 'YouTube',
      icon: FaYoutube,
      placeholder: 'https://youtube.com/@channel',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      focusColor: 'focus:ring-red-500'
    },
    {
      name: 'facebook',
      label: 'Facebook',
      icon: FaFacebook,
      placeholder: 'https://facebook.com/username',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      focusColor: 'focus:ring-blue-600'
    },
    {
      name: 'discord',
      label: 'Discord',
      icon: FaDiscord,
      placeholder: 'https://discord.com/users/id',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      focusColor: 'focus:ring-indigo-500'
    },
    {
      name: 'telegram',
      label: 'Telegram',
      icon: FaTelegram,
      placeholder: 'https://t.me/username',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      focusColor: 'focus:ring-blue-500'
    },
    {
      name: 'whatsapp',
      label: 'WhatsApp',
      icon: FaWhatsapp,
      placeholder: 'https://wa.me/1234567890',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      focusColor: 'focus:ring-green-500'
    }
  ];

  // ✅ Professional Links Fields
  const professionalFields = [
    {
      name: 'github',
      label: 'GitHub',
      icon: FaGithub,
      placeholder: 'https://github.com/username',
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      focusColor: 'focus:ring-gray-500'
    },
    {
      name: 'linkedin',
      label: 'LinkedIn',
      icon: FaLinkedin,
      placeholder: 'https://linkedin.com/in/username',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      focusColor: 'focus:ring-blue-700'
    },
    {
      name: 'portfolio',
      label: 'Portfolio',
      icon: GlobeAltIcon,
      placeholder: 'https://yourportfolio.com',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      focusColor: 'focus:ring-purple-500'
    }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="overflow-hidden bg-white shadow-sm rounded-xl">
          {/* Header */}
          <div className="px-6 py-8 bg-gradient-to-r from-blue-500 to-indigo-600">
            <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
            <p className="mt-1 text-blue-100">Update your personal and social media information</p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit}>
              {/* Profile Image */}
              <div className="mb-6">
                <label className="block mb-2 text-sm font-semibold text-gray-700">Profile Image</label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={imagePreview || 'https://via.placeholder.com/100'}
                      alt="Profile"
                      className="object-cover w-24 h-24 border-2 border-gray-200 rounded-full"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/100'}
                    />
                    <label className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
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
                    <p className="text-sm text-gray-600">Upload a profile picture</p>
                    <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="pt-6 mt-4 border-t border-gray-200">
                <h3 className="flex items-center mb-4 text-lg font-semibold">
                  <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">College</label>
                    <input
                      type="text"
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      className="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your college name"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your department"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Year</label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1st">1st Year</option>
                      <option value="2nd">2nd Year</option>
                      <option value="3rd">3rd Year</option>
                      <option value="4th">4th Year</option>
                      <option value="5th">5th Year</option>
                      <option value="Graduated">Graduated</option>
                    </select>
                  </div>
                </div>

                {/* Bio */}
                <div className="mt-4">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 transition border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Looking For */}
                <div className="mt-4">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Looking For</label>
                  <select
                    name="lookingFor"
                    value={formData.lookingFor}
                    onChange={handleChange}
                    className="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Study Partner">Study Partner</option>
                    <option value="Project Partner">Project Partner</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Friends">Friends</option>
                    <option value="Networking">Networking</option>
                  </select>
                </div>

                {/* Skills & Interests */}
                <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Skills (comma separated)</label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      className="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="JavaScript, React, Python..."
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Interests (comma separated)</label>
                    <input
                      type="text"
                      name="interests"
                      value={formData.interests}
                      onChange={handleChange}
                      className="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Coding, Music, Gaming..."
                    />
                  </div>
                </div>
              </div>

              {/* Professional Links */}
              <div className="pt-6 mt-6 border-t border-gray-200">
                <h3 className="flex items-center mb-4 text-lg font-semibold">
                  <BriefcaseIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Professional Links
                </h3>
                <div className="space-y-3">
                  {professionalFields.map((field) => (
                    <div key={field.name}>
                      <label className="flex items-center block mb-1 text-sm font-semibold text-gray-700">
                        <field.icon className={`h-4 w-4 mr-2 ${field.color}`} />
                        {field.label}
                      </label>
                      <input
                        type="url"
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border ${field.borderColor} rounded-lg focus:outline-none focus:ring-2 ${field.focusColor} transition ${field.bgColor}`}
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Media Links */}
              <div className="pt-6 mt-6 border-t border-gray-200">
                <h3 className="flex items-center mb-4 text-lg font-semibold">
                  <GlobeAltIcon className="w-5 h-5 mr-2 text-pink-600" />
                  Social Media
                </h3>
                <p className="mb-4 text-sm text-gray-500">
                  Add your social media profiles so others can connect with you outside the platform
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {socialMediaFields.map((field) => (
                    <div key={field.name}>
                      <label className="flex items-center block mb-1 text-sm font-semibold text-gray-700">
                        <field.icon className={`h-4 w-4 mr-2 ${field.color}`} />
                        {field.label}
                      </label>
                      <input
                        type="url"
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border ${field.borderColor} rounded-lg focus:outline-none focus:ring-2 ${field.focusColor} transition ${field.bgColor}`}
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex pt-6 mt-6 space-x-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="flex-1 py-3 font-medium text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditProfile;