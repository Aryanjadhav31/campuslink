import React, { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import { 
  HomeIcon, 
  UserGroupIcon, 
  ChatBubbleLeftIcon, 
  BellIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { icon: HomeIcon, label: 'Dashboard', path: '/dashboard' },
    { icon: UserGroupIcon, label: 'Students', path: '/students' },
    { icon: BellIcon, label: 'Notifications', path: '/notifications' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#000000]/95 backdrop-blur-md border-b border-gray-100 dark:border-[#262626] shadow-[0_2px_15px_rgba(0,0,0,0.03)] transition-colors duration-200">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-1 group">
            <span className="text-2xl font-black tracking-tight text-blue-600 transition-transform group-hover:scale-105">Campus</span>
            <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Link</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="items-center hidden space-x-3 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="p-2.5 rounded-full hover:bg-gray-100/80 dark:hover:bg-[#1A1A1A] text-gray-500 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-white transition-all relative group"
              >
                <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="absolute text-[11px] font-semibold text-gray-600 dark:text-zinc-300 bg-gray-900 dark:bg-zinc-800 text-white px-2 py-0.5 rounded-md transition-all transform -translate-x-1/2 opacity-0 -bottom-8 left-1/2 group-hover:opacity-100 pointer-events-none shadow-md">
                  {item.label}
                </span>
              </Link>
            ))}

            <Link
              to="/create-post"
              className="flex items-center px-4 py-2 ml-3 text-sm font-semibold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.03] hover:-translate-y-0.5"
            >
              <PlusCircleIcon className="h-5 w-5 mr-1.5" />
              Post
            </Link>

            {/* Profile Dropdown */}
            <Menu as="div" className="relative ml-3">
              <Menu.Button className="flex items-center space-x-2 transition-all p-0.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:scale-105 shadow-sm">
                <img
                  src={user?.profileImage || 'https://via.placeholder.com/40'}
                  alt={user?.name || 'Profile'}
                  className="object-cover w-9 h-9 border-2 border-white dark:border-[#121212] rounded-full"
                />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 w-56 py-1.5 mt-2 origin-top-right bg-white dark:bg-[#121212] border border-gray-100 dark:border-[#262626] shadow-xl rounded-2xl focus:outline-none">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-[#262626]">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-zinc-400 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/profile"
                        className={`${
                          active ? 'bg-gray-50 dark:bg-[#1A1A1A] text-blue-600 dark:text-white' : 'text-gray-700 dark:text-zinc-300'
                        } flex items-center px-4 py-2.5 text-sm font-medium transition-colors`}
                      >
                        <UserIcon className="w-5 h-5 mr-3 text-gray-400 dark:text-zinc-400" />
                        My Profile
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/settings"
                        className={`${
                          active ? 'bg-gray-50 dark:bg-[#1A1A1A] text-blue-600 dark:text-white' : 'text-gray-700 dark:text-zinc-300'
                        } flex items-center px-4 py-2.5 text-sm font-medium transition-colors`}
                      >
                        <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-400 dark:text-zinc-400" />
                        Settings
                      </Link>
                    )}
                  </Menu.Item>
                  {user?.role === 'admin' && (
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/admin"
                          className={`${
                            active ? 'bg-gray-50 dark:bg-[#1A1A1A] text-blue-600 dark:text-white' : 'text-gray-700 dark:text-zinc-300'
                          } flex items-center px-4 py-2.5 text-sm font-medium transition-colors`}
                        >
                          <ShieldCheckIcon className="w-5 h-5 mr-3 text-gray-400 dark:text-zinc-400" />
                          Admin Panel
                        </Link>
                      )}
                    </Menu.Item>
                  )}
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${
                          active ? 'bg-red-50 dark:bg-red-500/10 text-red-600' : 'text-red-500'
                        } flex items-center w-full px-4 py-2.5 text-sm font-medium transition-colors border-t border-gray-100 dark:border-[#262626]`}
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 text-red-400" />
                        Logout
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Menu as="div" className="relative">
              <Menu.Button className="p-2 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-[#1A1A1A]">
                <svg className="w-6 h-6 text-gray-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 w-52 py-1 mt-2 bg-white dark:bg-[#121212] border border-gray-100 dark:border-[#262626] shadow-xl rounded-2xl">
                  {navItems.map((item) => (
                    <Menu.Item key={item.path}>
                      {({ active }) => (
                        <Link
                          to={item.path}
                          className={`${
                            active ? 'bg-gray-50 dark:bg-[#1A1A1A] text-blue-600 dark:text-white' : 'text-gray-700 dark:text-zinc-300'
                          } flex items-center px-4 py-2.5 text-sm font-medium`}
                        >
                          <item.icon className="w-5 h-5 mr-3 text-gray-400 dark:text-zinc-400" />
                          {item.label}
                        </Link>
                      )}
                    </Menu.Item>
                  ))}
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/create-post"
                        className={`${
                          active ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'text-blue-600 dark:text-blue-400'
                        } flex items-center px-4 py-2.5 text-sm font-semibold border-t border-gray-100 dark:border-[#262626]`}
                      >
                        <PlusCircleIcon className="w-5 h-5 mr-3 text-blue-500" />
                        Create Post
                      </Link>
                    )}
                  </Menu.Item>
                  {user?.role === 'admin' && (
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/admin"
                          className={`${
                            active ? 'bg-gray-50 dark:bg-[#1A1A1A] text-blue-600 dark:text-white' : 'text-gray-700 dark:text-zinc-300'
                          } flex items-center px-4 py-2.5 text-sm font-medium border-t border-gray-100 dark:border-[#262626]`}
                        >
                          <ShieldCheckIcon className="w-5 h-5 mr-3 text-gray-400 dark:text-zinc-400" />
                          Admin Panel
                        </Link>
                      )}
                    </Menu.Item>
                  )}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;