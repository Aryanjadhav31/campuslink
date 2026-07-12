import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    
    try {
      console.log('📤 Sending login request:', { email });
      
      // USING THE FULL URL - SAME AS REGISTRATION
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        {
          email: email,
          password: password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Login response:', response.data);
      
      if (response.data.token) {
        // Store token
        localStorage.setItem('token', response.data.token);
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        toast.success('Login successful! 🎉');
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        toast.error('Login failed - no token received');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
        
        if (error.response.status === 401) {
          toast.error('Invalid email or password');
        } else {
          toast.error(error.response.data?.message || 'Login failed');
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.log('No response received');
        toast.error('Cannot connect to server. Make sure backend is running.');
      } else {
        // Something happened in setting up the request
        toast.error('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl">
        <h2 className="mb-8 text-3xl font-bold text-center">Welcome Back</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your.email@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;