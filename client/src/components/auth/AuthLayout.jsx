import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900 dark:bg-[#000000] dark:text-white font-sans antialiased flex flex-col items-center justify-center p-5 sm:p-6 select-none transition-colors duration-200">
      <div className="w-full max-w-[450px] my-auto py-8">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
