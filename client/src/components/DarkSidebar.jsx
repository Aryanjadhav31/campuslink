import React, { useState, Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Logo from './auth/Logo';
import { Menu, Transition } from '@headlessui/react';
import { 
  HomeIcon, 
  UserGroupIcon, 
  BellIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeSolid,
  UserGroupIcon as UserGroupSolid,
  BellIcon as BellSolid,
  UserIcon as UserSolid
} from '@heroicons/react/24/solid';

const DarkSidebar = ({ activeTab = 'profile' }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { key: 'home', label: 'Home', path: '/dashboard', outlineIcon: HomeIcon, solidIcon: HomeSolid },
    { key: 'friends', label: 'Friends', path: '/friends', outlineIcon: UserGroupIcon, solidIcon: UserGroupSolid },
    { key: 'notifications', label: 'Notifications', path: '/notifications', outlineIcon: BellIcon, solidIcon: BellSolid, badge: unreadCount },
    { key: 'search', label: 'Search', path: '/search', outlineIcon: MagnifyingGlassIcon, solidIcon: MagnifyingGlassIcon },
    { key: 'create', label: 'Create Post', path: '/create-post', outlineIcon: PlusCircleIcon, solidIcon: PlusCircleIcon }
  ];

  if (user?.role === 'admin') {
    navItems.push({
      key: 'admin',
      label: 'Admin Panel',
      path: '/admin',
      outlineIcon: ShieldCheckIcon,
      solidIcon: ShieldCheckIcon
    });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-gray-200 dark:bg-[#000000] dark:border-[#262626] flex flex-col justify-between p-4 hidden md:flex select-none font-sans transition-colors duration-200">
      
      {/* Top Section: Logo & Nav Items */}
      <div className="space-y-6">
        {/* App Logo Icon at Top */}
        <div className="px-2 pt-1">
          <Logo size="small" showLink={true} />
        </div>

        {/* Vertical Navigation Items */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const currentPath = location.pathname;
            let isActive = false;
            if (item.key === 'home' && currentPath === '/dashboard') isActive = true;
            else if (item.key === 'friends' && currentPath === '/friends') isActive = true;
            else if (item.key === 'notifications' && currentPath === '/notifications') isActive = true;
            else if (item.key === 'search' && (currentPath === '/search' || currentPath.startsWith('/students/'))) isActive = true;
            else if (item.key === 'create' && currentPath === '/create-post') isActive = true;
            else if (activeTab === item.key) isActive = true;

            const Icon = isActive ? item.solidIcon : item.outlineIcon;

            return (
              <Link
                key={item.key}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 dark:bg-[#1A1A1A] dark:text-white font-bold' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-[#1A1A1A] font-medium'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-blue-600 dark:text-white' : 'text-gray-500 group-hover:text-gray-900 dark:text-zinc-300 dark:group-hover:text-white'}`} />
                  
                  {/* Notification Badge */}
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-black">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-sm tracking-tight ${isActive ? 'font-bold text-blue-600 dark:text-white' : 'text-gray-700 dark:text-zinc-200'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: "More" Menu */}
      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-[#262626]">
        
        {/* More Menu Dropdown */}
        <Menu as="div" className="relative w-full">
          <Menu.Button className="w-full flex items-center space-x-4 px-4 py-3 rounded-[8px] text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-[#1A1A1A] transition-colors">
            <Bars3Icon className="w-6 h-6 text-gray-500 dark:text-zinc-300" />
            <span className="text-base font-medium">More</span>
          </Menu.Button>
          
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95 -translate-y-2"
            enterTo="transform opacity-100 scale-100 translate-y-0"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100 translate-y-0"
            leaveTo="transform opacity-0 scale-95 -translate-y-2"
          >
            <Menu.Items className="absolute bottom-14 left-0 w-56 py-1.5 bg-white border border-gray-200 dark:bg-[#121212] dark:border-[#262626] rounded-xl shadow-2xl focus:outline-none z-50">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/settings"
                    className={`flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-zinc-200 ${active ? 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-900 dark:text-white' : ''}`}
                  >
                    <Cog6ToothIcon className="w-5 h-5 text-gray-400 dark:text-zinc-400" />
                    <span>Settings</span>
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={`flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-500 border-t border-gray-100 dark:border-[#262626] ${active ? 'bg-red-500/10' : ''}`}
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-500" />
                    <span>Log out</span>
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>

      </div>
    </aside>
  );
};

export default DarkSidebar;
