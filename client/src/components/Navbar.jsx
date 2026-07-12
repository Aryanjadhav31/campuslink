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
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { icon: HomeIcon, label: 'Dashboard', path: '/dashboard' },
    { icon: UserGroupIcon, label: 'Students', path: '/students' },
    { icon: ChatBubbleLeftIcon, label: 'Messages', path: '/messages' },
    { icon: BellIcon, label: 'Notifications', path: '/notifications' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-1">
            <span className="text-2xl font-bold text-blue-600">Campus</span>
            <span className="text-2xl font-bold text-gray-800">Link</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="items-center hidden space-x-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors relative group"
              >
                <item.icon className="w-6 h-6 text-gray-600 transition-colors group-hover:text-blue-600" />
                <span className="absolute text-xs text-gray-500 transition-opacity transform -translate-x-1/2 opacity-0 -bottom-1 left-1/2 group-hover:opacity-100">
                  {item.label}
                </span>
              </Link>
            ))}

            <Link
              to="/create-post"
              className="flex items-center px-4 py-2 ml-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <PlusCircleIcon className="h-5 w-5 mr-1.5" />
              Post
            </Link>

            {/* Profile Dropdown */}
            <Menu as="div" className="relative ml-2">
              <Menu.Button className="flex items-center space-x-2 transition-opacity focus:outline-none hover:opacity-80">
                <img
                  src={user?.profileImage || 'https://via.placeholder.com/40'}
                  alt={user?.name || 'Profile'}
                  className="object-cover w-10 h-10 border-2 border-gray-200 rounded-full"
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
                <Menu.Items className="absolute right-0 w-56 py-1 mt-2 origin-top-right bg-white border border-gray-100 shadow-lg rounded-xl">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/profile"
                        className={`${
                          active ? 'bg-gray-50' : ''
                        } flex items-center px-4 py-2.5 text-sm text-gray-700 transition-colors`}
                      >
                        <UserIcon className="w-5 h-5 mr-3 text-gray-400" />
                        My Profile
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/settings"
                        className={`${
                          active ? 'bg-gray-50' : ''
                        } flex items-center px-4 py-2.5 text-sm text-gray-700 transition-colors`}
                      >
                        <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-400" />
                        Settings
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${
                          active ? 'bg-gray-50' : ''
                        } flex items-center w-full px-4 py-2.5 text-sm text-red-600 transition-colors border-t border-gray-100`}
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
              <Menu.Button className="p-2 transition-colors rounded-lg hover:bg-gray-100">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <Menu.Items className="absolute right-0 w-48 py-1 mt-2 bg-white border border-gray-100 shadow-lg rounded-xl">
                  {navItems.map((item) => (
                    <Menu.Item key={item.path}>
                      {({ active }) => (
                        <Link
                          to={item.path}
                          className={`${
                            active ? 'bg-gray-50' : ''
                          } flex items-center px-4 py-2.5 text-sm text-gray-700`}
                        >
                          <item.icon className="w-5 h-5 mr-3 text-gray-400" />
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
                          active ? 'bg-gray-50' : ''
                        } flex items-center px-4 py-2.5 text-sm text-blue-600 border-t border-gray-100`}
                      >
                        <PlusCircleIcon className="w-5 h-5 mr-3 text-blue-400" />
                        Create Post
                      </Link>
                    )}
                  </Menu.Item>
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