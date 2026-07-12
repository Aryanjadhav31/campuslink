import React from 'react';

const ScrollIndicator = () => {
  return (
    <div className="absolute hidden transform -translate-x-1/2 bottom-8 left-1/2 md:block">
      <div className="flex flex-col items-center space-y-3">
        {/* Premium Mouse Icon */}
        <div className="relative group">
          <div className="w-6 h-10 transition-colors duration-300 border-2 border-gray-300 rounded-full group-hover:border-blue-500">
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-scroll-dot"></div>
          </div>
        </div>
        {/* Glowing Progress Line */}
        <div className="w-px h-8 bg-gradient-to-b from-blue-400 to-transparent animate-scroll-line"></div>
        <span className="text-xs font-medium tracking-[0.2em] text-gray-400 uppercase animate-pulse">
          Explore
        </span>
      </div>
    </div>
  );
};

export default ScrollIndicator;