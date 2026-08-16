import React, { useState, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  UserIcon,
  PencilSquareIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const TopHeader = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="sticky top-0 z-40 w-full h-16 bg-[#111111]/90 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between px-4 sm:px-8 transition-colors duration-200"
    >
      {/* ---------------- LEFT SECTION (EMPTY) ---------------- */}
      <div className="w-10 sm:w-16 shrink-0 pointer-events-none" />

      {/* ---------------- CENTER SECTION: SEARCH BAR ONLY ---------------- */}
      <div className="flex-1 flex justify-center items-center px-4 max-w-xl mx-auto">
        <form
          onSubmit={handleSearch}
          className={`relative w-full transition-all duration-200 ${isSearchFocused ? 'max-w-[500px]' : 'max-w-[420px] sm:max-w-[460px]'
            }`}
        >
          <div className="relative flex items-center w-full">
            <MagnifyingGlassIcon className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search students, communities, posts..."
              className="w-full h-[42px] pl-11 pr-4 bg-[#1A1A1A] hover:bg-[#202020] text-white text-xs sm:text-sm placeholder-gray-400 rounded-full border border-white/[0.08] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-600/30 focus:outline-none focus:shadow-[0_0_15px_rgba(37,99,235,0.25)] transition-all duration-200"
            />
          </div>
        </form>
      </div>

      {/* ---------------- RIGHT SECTION: AVATAR ONLY & DROPDOWN ---------------- */}
      <div className="flex items-center justify-end shrink-0 w-10 sm:w-16">
        <Menu as="div" className="relative inline-block text-left">
          {/* Circular Avatar Trigger Button */}
          <Menu.Button className="flex items-center justify-center p-0.5 rounded-full cursor-pointer focus:outline-none group">
            <img
              src={user?.profileImage || 'https://via.placeholder.com/40'}
              alt={user?.name || 'Profile'}
              className="w-10 h-10 rounded-full object-cover border-2 border-white/20 group-hover:border-blue-500/60 group-hover:scale-105 transition-all duration-200 shadow-md"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/40';
              }}
            />
          </Menu.Button>

          {/* Dark Glassmorphism Dropdown Menu */}
          <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="transform opacity-0 scale-95 -translate-y-1"
            enterTo="transform opacity-100 scale-100 translate-y-0"
            leave="transition ease-in duration-100"
            leaveFrom="transform opacity-100 scale-100 translate-y-0"
            leaveTo="transform opacity-0 scale-95 -translate-y-1"
          >
            <Menu.Items className="absolute right-0 mt-2 w-56 py-2 bg-[#161616]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl focus:outline-none z-50">

              {/* Header Profile Info inside Dropdown */}
              <div className="px-4 py-2.5 border-b border-white/[0.08] mb-1">
                <p className="text-sm font-bold text-white truncate">
                  {user?.name || 'Student'}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  @{user?.username || 'student'}
                </p>
              </div>

              {/* 1. My Profile */}
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/profile"
                    className={`${active ? 'bg-blue-600/20 text-white' : 'text-gray-300'
                      } flex items-center px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl mx-1 transition-colors duration-150`}
                  >
                    <UserIcon className="w-4 h-4 mr-3 text-blue-400" />
                    My Profile
                  </Link>
                )}
              </Menu.Item>

              {/* 2. Edit Profile */}
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/settings?tab=profile"
                    className={`${active ? 'bg-blue-600/20 text-white' : 'text-gray-300'
                      } flex items-center px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl mx-1 transition-colors duration-150`}
                  >
                    <PencilSquareIcon className="w-4 h-4 mr-3 text-blue-400" />
                    Edit Profile
                  </Link>
                )}
              </Menu.Item>

              {/* 3. Saved Posts */}
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/profile?tab=saved"
                    className={`${active ? 'bg-blue-600/20 text-white' : 'text-gray-300'
                      } flex items-center px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl mx-1 transition-colors duration-150`}
                  >
                    <BookmarkIcon className="w-4 h-4 mr-3 text-blue-400" />
                    Saved Posts
                  </Link>
                )}
              </Menu.Item>

              {/* 4. Settings */}
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/settings"
                    className={`${active ? 'bg-blue-600/20 text-white' : 'text-gray-300'
                      } flex items-center px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl mx-1 transition-colors duration-150`}
                  >
                    <Cog6ToothIcon className="w-4 h-4 mr-3 text-blue-400" />
                    Settings
                  </Link>
                )}
              </Menu.Item>

              {/* Admin Panel (Admin Only) */}
              {user?.role === 'admin' && (
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/admin"
                      className={`${active ? 'bg-blue-600/20 text-white' : 'text-gray-300'
                        } flex items-center px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl mx-1 transition-colors duration-150`}
                    >
                      <ShieldCheckIcon className="w-4 h-4 mr-3 text-blue-400" />
                      Admin Panel
                    </Link>
                  )}
                </Menu.Item>
              )}

              {/* 5. Theme Toggle Switch */}
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleTheme();
                    }}
                    className={`${active ? 'bg-blue-600/20 text-white' : 'text-gray-300'
                      } flex items-center justify-between w-full px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl mx-1 transition-colors duration-150 cursor-pointer select-none`}
                    title="Toggle Theme"
                    aria-label="Toggle Theme"
                  >
                    <div className="flex items-center">
                      {isDark ? (
                        <MoonIcon className="w-4 h-4 mr-3 text-blue-400" />
                      ) : (
                        <SunIcon className="w-4 h-4 mr-3 text-amber-500" />
                      )}
                      <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                    </div>

                    {/* Modern iOS/Material Style Switcher */}
                    <div
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out ${
                        isDark ? 'bg-blue-600' : 'bg-gray-500/40'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-200 ease-in-out shadow-sm ${
                          isDark ? 'translate-x-4.5' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </button>
                )}
              </Menu.Item>

              {/* 5. Logout */}
              <div className="pt-1 mt-1 border-t border-white/[0.08]">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${active ? 'bg-red-500/20 text-red-400' : 'text-red-400'
                        } flex items-center w-full px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl mx-1 transition-colors duration-150`}
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3 text-red-400" />
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </motion.header>
  );
};

export default TopHeader;
