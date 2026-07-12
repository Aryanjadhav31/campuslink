import React from 'react';
import { 
  UsersIcon, 
  ChatBubbleLeftIcon, 
  UserGroupIcon, 
  CalendarIcon,
  AcademicCapIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

const BackgroundEffects = () => {
  return (
    <>
      {/* Gradient Orbs */}
      <div className="absolute rounded-full -top-40 -right-40 w-96 h-96 bg-blue-200/20 blur-3xl animate-pulse"></div>
      <div className="absolute delay-1000 rounded-full -bottom-40 -left-40 w-96 h-96 bg-purple-200/20 blur-3xl animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-100/10 rounded-full blur-3xl"></div>
      <div className="absolute w-64 h-64 rounded-full top-1/4 right-1/4 bg-blue-100/20 blur-2xl"></div>
      <div className="absolute rounded-full bottom-1/4 left-1/4 w-80 h-80 bg-purple-100/20 blur-2xl"></div>
      
      {/* Premium Floating Elements */}
      <div className="absolute hidden top-20 left-10 animate-float xl:block">
        <div className="p-4 border shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl border-gray-100/50">
          <UsersIcon className="w-8 h-8 text-blue-600" />
        </div>
      </div>
      <div className="absolute hidden top-40 right-20 animate-float xl:block" style={{ animationDelay: '0.5s' }}>
        <div className="p-4 border shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl border-gray-100/50">
          <ChatBubbleLeftIcon className="w-8 h-8 text-purple-600" />
        </div>
      </div>
      <div className="absolute hidden bottom-40 left-20 animate-float xl:block" style={{ animationDelay: '1s' }}>
        <div className="p-4 border shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl border-gray-100/50">
          <UserGroupIcon className="w-8 h-8 text-green-600" />
        </div>
      </div>
      <div className="absolute hidden bottom-20 right-10 animate-float xl:block" style={{ animationDelay: '1.5s' }}>
        <div className="p-4 border shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl border-gray-100/50">
          <CalendarIcon className="w-8 h-8 text-orange-600" />
        </div>
      </div>
    </>
  );
};

export default BackgroundEffects;