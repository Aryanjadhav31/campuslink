import React from 'react';
import { FaGoogle } from 'react-icons/fa';

const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    // Google OAuth logic here
    console.log('Google login clicked');
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center space-x-3 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow"
    >
      <FaGoogle className="w-5 h-5 text-red-500" />
      <span className="font-medium text-gray-700">Continue with Google</span>
    </button>
  );
};

export default GoogleLoginButton;