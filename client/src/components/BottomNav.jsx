import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  PlusCircleIcon, 
  BellIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeSolid,
  MagnifyingGlassIcon as SearchSolid,
  PlusCircleIcon as PlusSolid,
  BellIcon as BellSolid,
  UserIcon as UserSolid
} from '@heroicons/react/24/solid';

const BottomNav = () => {
  const { user } = useAuth();
  const { unreadCount } = useSocket();
  const location = useLocation();

  if (!user) return null;

  const currentPath = location.pathname;

  const items = [
    {
      key: 'home',
      label: 'Home',
      path: '/dashboard',
      outline: HomeIcon,
      solid: HomeSolid,
      isActive: currentPath === '/dashboard'
    },
    {
      key: 'search',
      label: 'Search',
      path: '/search',
      outline: MagnifyingGlassIcon,
      solid: SearchSolid,
      isActive: currentPath === '/search' || currentPath.startsWith('/students/')
    },
    {
      key: 'create',
      label: 'Create',
      path: '/create-post',
      outline: PlusCircleIcon,
      solid: PlusSolid,
      isActive: currentPath === '/create-post'
    },
    {
      key: 'notifications',
      label: 'Activity',
      path: '/notifications',
      outline: BellIcon,
      solid: BellSolid,
      badge: unreadCount,
      isActive: currentPath === '/notifications'
    },
    {
      key: 'profile',
      label: 'Profile',
      path: '/profile',
      outline: UserIcon,
      solid: UserSolid,
      isAvatar: true,
      isActive: currentPath === '/profile'
    }
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-colors duration-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-14 px-2">
        {items.map((item) => {
          const Icon = item.isActive ? item.solid : item.outline;

          return (
            <Link
              key={item.key}
              to={item.path}
              className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-150 ${
                item.isActive 
                  ? 'text-blue-600 dark:text-blue-500 scale-105' 
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {item.isAvatar ? (
                <div className={`relative p-0.5 rounded-full ${item.isActive ? 'ring-2 ring-blue-600 dark:ring-blue-500' : ''}`}>
                  <img
                    src={user?.profileImage || 'https://via.placeholder.com/40'}
                    alt={user?.name || 'Profile'}
                    className="w-6 h-6 rounded-full object-cover"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                  />
                </div>
              ) : (
                <div className="relative">
                  <Icon className="w-6 h-6 transition-transform" />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-black">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
              )}
              <span className={`text-[10px] font-medium mt-0.5 ${item.isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
