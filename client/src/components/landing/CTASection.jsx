import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const CTASection = () => {
  return (
    <section className="relative py-24 overflow-hidden bg-[#000000] border-t border-[#1f1f23] text-white">
      <div className="container relative z-10 px-4 mx-auto sm:px-6 lg:px-8 max-w-[1440px]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-1.5 mb-6 text-xs font-semibold text-zinc-300 bg-[#121212] border border-[#262626] rounded-full">
            <SparklesIcon className="w-4 h-4 mr-2 text-[#0095F6]" />
            Join the Community
          </div>
          
          <h2 className="mb-6 text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Transform Your{' '}
            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              College Experience
            </span>
            ?
          </h2>
          
          <p className="max-w-2xl mx-auto mb-8 text-lg sm:text-xl text-zinc-400 font-normal">
            Join thousands of students already connecting and collaborating on CampusLink. Start building your network today.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-white bg-[#0095F6] hover:bg-[#1877F2] active:bg-[#0074CC] rounded-xl transition-colors cursor-pointer group"
            >
              <span>Create Free Account</span>
              <ArrowRightIcon className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-white bg-transparent border border-[#262626] hover:bg-[#1c1c1e] rounded-xl transition-colors cursor-pointer"
            >
              Sign In
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs sm:text-sm font-medium text-zinc-400">
            <div className="flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-2 text-[#0095F6]" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-2 text-[#0095F6]" />
              Free forever for students
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-2 text-[#0095F6]" />
              Verified student community
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;