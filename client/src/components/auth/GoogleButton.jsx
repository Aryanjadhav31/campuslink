import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import toast from 'react-hot-toast';

const GoogleButton = ({ onSuccess, onError, isLoading }) => {
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );

        if (onSuccess) {
          onSuccess({
            googleId: userInfo.data.sub,
            email: userInfo.data.email,
            name: userInfo.data.name,
            profileImage: userInfo.data.picture
          });
        }
      } catch (err) {
        console.error('Google UserInfo Fetch Error:', err);
        toast.error('Failed to authenticate with Google');
        if (onError) onError(err);
      }
    },
    onError: (errorResponse) => {
      console.error('Google Login Error:', errorResponse);
      toast.error('Google Sign-in was cancelled or failed');
      if (onError) onError(errorResponse);
    }
  });

  return (
    <button
      type="button"
      onClick={() => loginWithGoogle()}
      disabled={isLoading}
      aria-label="Continue with Google"
      className="w-full h-[44px] bg-transparent hover:bg-[#1c1c1e] text-white font-semibold text-sm rounded-xl border border-[#262626] flex items-center justify-center space-x-2.5 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-[#0095F6] disabled:opacity-50 cursor-pointer"
    >
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z" />
        <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z" />
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
      </svg>
      <span>Continue with Google</span>
    </button>
  );
};

export default GoogleButton;

