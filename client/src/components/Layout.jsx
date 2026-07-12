import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 ${className}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;