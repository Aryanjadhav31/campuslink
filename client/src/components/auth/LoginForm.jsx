import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import InputField from './InputField';
import PasswordInput from './PasswordInput';
import GoogleButton from './GoogleButton';
import Divider from './Divider';
import Logo from './Logo';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isShaking, setIsShaking] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Username or email is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      triggerShake();
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res?.success) {
        localStorage.setItem('rememberedEmail', email);
        navigate('/dashboard');
      } else {
        triggerShake();
      }
    } catch (err) {
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (googleUser) => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/google', googleUser);
      if (data.token) {
        localStorage.setItem('token', data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        toast.success(`Welcome back, ${data.name}! 🎉`);
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Google Server Auth error:', err);
      const msg = err.response?.data?.message || 'Google Authentication failed';
      toast.error(msg);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`w-full transition-all duration-300 ${isShaking ? 'animate-shake' : ''
        }`}
    >
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center">
        <Logo
          size="large"
          layout="stacked"
          showLink={false}
          subtitle="Welcome back to CampusLink"
        />
      </div>

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        {/* Username or Email Input */}
        <InputField
          id="login-email"
          name="email"
          type="text"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors(prev => ({ ...prev, email: null }));
          }}
          placeholder="Username or email"
          error={errors.email}
          required
          autoComplete="username"
        />

        {/* Password Input */}
        <PasswordInput
          id="login-password"
          name="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors(prev => ({ ...prev, password: null }));
          }}
          placeholder="Password"
          error={errors.password}
          required
        />

        {/* Primary Submit Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-[44px] mt-2 bg-[#0095F6] hover:bg-[#1877F2] active:bg-[#0074CC] text-white font-semibold text-sm rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Logging in...</span>
            </div>
          ) : (
            <span>Log in</span>
          )}
        </button>

        {/* Forgot Password Link */}
        <div className="text-center pt-2">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              toast('Password reset link sent to your email.', { icon: 'ℹ️' });
            }}
            className="text-xs font-semibold text-[#0095F6] hover:underline transition-all"
          >
            Forgot password?
          </a>
        </div>
      </form>

      {/* Divider */}
      <Divider text="OR" />

      {/* Secondary Action - Google Button */}
      <div className="mb-6">
        <GoogleButton
          onSuccess={handleGoogleSuccess}
          onError={() => triggerShake()}
          isLoading={isLoading}
        />
      </div>

      {/* Bottom Switch Account Text */}
      <div className="text-center pt-4 border-t border-[#262626] text-sm text-zinc-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-[#0095F6] hover:underline transition-colors">
          Create account
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;

