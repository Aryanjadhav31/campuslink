import React from 'react';
import Navbar from './Navbar';
import DarkSidebar from './DarkSidebar';
import BottomNav from './BottomNav';

const Layout = ({ children, className = '', activeTab }) => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#000000] dark:text-white font-sans transition-colors duration-200">
      {/* Mobile Top Header */}
      <Navbar />

      {/* Desktop Left Sidebar (Fixed 256px / w-64) */}
      <DarkSidebar activeTab={activeTab} />

      {/* Main Centered Content Container Offset by Sidebar (md:pl-64) */}
      <div className="md:pl-64 min-h-screen flex flex-col pt-16 md:pt-0 pb-20 md:pb-6">
        <main className={`flex-1 w-full ${className}`}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
};

export default Layout;