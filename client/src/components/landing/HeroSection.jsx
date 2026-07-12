import React from 'react';
import { Link } from 'react-router-dom';
import { 
  SparklesIcon, 
  ArrowRightIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import BackgroundEffects from './BackgroundEffects';
import ScrollIndicator from './ScrollIndicator';
import UpcomingEvents from './UpcomingEvents';

const HeroSection = () => {
  return (
    <section className="relative flex items-center min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50/30">
      <BackgroundEffects />

      <div className="container relative z-10 px-4 py-12 mx-auto sm:px-6 lg:px-8">
        <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
              <SparklesIcon className="w-4 h-4 mr-2" />
              The Future of Student Networking
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Connect with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                Students
              </span>
              <br />
              <span className="text-gray-800">Like Never Before</span>
            </h1>

            <p className="max-w-lg mb-8 text-xl leading-relaxed text-gray-600">
              A secure networking platform for college students to connect, collaborate, 
              chat, discover events, and build professional and social relationships.
            </p>

            <div className="flex flex-col gap-4 mb-8 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all transform shadow-lg group bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl hover:from-blue-700 hover:to-indigo-700 hover:scale-105 shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                Get Started Free
                <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 transition-all bg-white border border-gray-200 shadow-sm rounded-2xl hover:bg-gray-50"
              >
                Sign In
              </Link>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <CheckBadgeIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600">100% Free</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600">Secure Platform</span>
              </div>
              <div className="flex items-center space-x-2">
                <UserPlusIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600">Verified Students</span>
              </div>
            </div>
          </div>

          {/* Right Content - Upcoming Events */}
          <div className="hidden lg:block">
            <UpcomingEvents />
          </div>
        </div>
      </div>

      <ScrollIndicator />
    </section>
  );
};

export default HeroSection;