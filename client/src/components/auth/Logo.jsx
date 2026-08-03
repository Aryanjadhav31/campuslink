import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 'normal', showLink = true, className = '' }) => {
  const isSmall = size === 'small';

  const content = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon Badge */}
      <div className={`flex items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-bold ${isSmall ? 'w-8 h-8 text-sm' : 'w-9 h-9 text-base'
        }`}>
        <svg
          className={isSmall ? 'w-4 h-4' : 'w-5 h-5'}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex items-center tracking-tight font-bold font-sans">
        <span className={`text-white ${isSmall ? 'text-lg' : 'text-xl'}`}>
          Campus
        </span>
        <span className={`text-[#0095F6] ${isSmall ? 'text-lg' : 'text-xl'}`}>
          Link
        </span>
      </div>
    </div>
  );

  if (showLink) {
    return (
      <Link to="/" className="inline-block focus:outline-none focus-visible:ring-1 focus-visible:ring-[#0095F6] rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;

