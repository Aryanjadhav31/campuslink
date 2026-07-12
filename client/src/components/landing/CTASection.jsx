import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const CTASection = () => {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full -top-40 -right-40 w-96 h-96 bg-white/5 blur-3xl animate-pulse"></div>
        <div className="absolute delay-1000 rounded-full -bottom-40 -left-40 w-96 h-96 bg-white/5 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
        
        {/* Floating Particles */}
        <div className="absolute w-2 h-2 rounded-full top-1/4 left-1/4 bg-white/30 animate-ping"></div>
        <div className="absolute w-3 h-3 delay-500 rounded-full top-3/4 right-1/4 bg-white/20 animate-ping"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-white/40 rounded-full animate-ping delay-1000"></div>
      </div>

      <div className="container relative z-10 px-4 mx-auto sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium text-blue-600 rounded-full bg-white/20 backdrop-blur-sm">
            <SparklesIcon className="w-4 h-4 mr-2" />
            Join the Community
          </div>
          
          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
            Ready to Transform Your <span className="text-yellow-300">College Experience</span>?
          </h2>
          
          <p className="max-w-2xl mx-auto mb-8 text-xl text-blue-100">
            Join thousands of students already connecting and collaborating on CampusLink. Start building your network today.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-blue-600 transition-all transform bg-white shadow-xl rounded-2xl hover:bg-gray-50 hover:scale-105 shadow-blue-500/30 group"
            >
              Create Free Account
              <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white transition-all bg-transparent border-2 rounded-2xl hover:bg-white/10 border-white/30"
            >
              Sign In
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            <div className="flex items-center text-sm text-blue-200">
              <CheckCircleIcon className="w-4 h-4 mr-2 text-blue-300" />
              No credit card required
            </div>
            <div className="flex items-center text-sm text-blue-200">
              <CheckCircleIcon className="w-4 h-4 mr-2 text-blue-300" />
              Free forever for students
            </div>
            <div className="flex items-center text-sm text-blue-200">
              <CheckCircleIcon className="w-4 h-4 mr-2 text-blue-300" />
              Verified student community
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;