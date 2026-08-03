import React from 'react';
import { Link } from 'react-router-dom';
import { 
  SparklesIcon, 
  ArrowRightIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import Logo from '../auth/Logo';
import BackgroundEffects from './BackgroundEffects';
import IllustrationSection from '../auth/IllustrationSection';

const HeroSection = () => {
  return (
    <section className="relative flex flex-col justify-between min-h-screen overflow-hidden bg-[#000000] text-white">
      <BackgroundEffects />

      {/* Top Header Navigation */}
      <header className="relative z-20 w-full max-w-[1440px] mx-auto px-6 py-6 flex items-center justify-between">
        <Logo size="normal" />

        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-transparent border border-[#262626] hover:bg-[#1c1c1e] rounded-xl transition-all"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0095F6] hover:bg-[#1877F2] rounded-xl transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Content */}
      <div className="container relative z-10 px-4 py-12 mx-auto my-auto sm:px-6 lg:px-8 max-w-[1440px]">
        <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <div className="text-left space-y-6">
            {/* Dark Theme Badge Pill */}
            <div className="inline-flex items-center px-4 py-1.5 text-xs font-semibold text-zinc-300 bg-[#121212] border border-[#262626] rounded-full">
              <SparklesIcon className="w-4 h-4 mr-2 text-[#0095F6]" />
              The Future of Student Networking
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white tracking-tight">
              Connect with{' '}
              <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                Students
              </span>
              <br />
              Like Never Before
            </h1>

            {/* Supporting Text */}
            <p className="max-w-lg text-lg sm:text-xl font-normal leading-relaxed text-zinc-400">
              A secure networking platform for college students to connect, collaborate, 
              chat, discover events, and build professional and social relationships.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-white bg-[#0095F6] hover:bg-[#1877F2] active:bg-[#0074CC] rounded-xl transition-colors cursor-pointer group"
              >
                <span>Get Started Free</span>
                <ArrowRightIcon className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-white bg-transparent border border-[#262626] hover:bg-[#1c1c1e] rounded-xl transition-colors cursor-pointer"
              >
                Sign In
              </Link>
            </div>

            {/* Inline Trust Text - Minimal icons, no colored pill cards */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs sm:text-sm font-medium text-zinc-400">
              <div className="flex items-center space-x-2">
                <CheckBadgeIcon className="w-4 h-4 text-[#0095F6]" />
                <span>100% Free</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="w-4 h-4 text-[#0095F6]" />
                <span>Secure Platform</span>
              </div>
              <div className="flex items-center space-x-2">
                <UserPlusIcon className="w-4 h-4 text-[#0095F6]" />
                <span>Verified Students</span>
              </div>
            </div>
          </div>

          {/* Right Content - Clean Single Mockup Illustration (No Upcoming Events card) */}
          <div className="flex items-center justify-center">
            <IllustrationSection />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;