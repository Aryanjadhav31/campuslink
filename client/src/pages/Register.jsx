import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { 
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { FaGoogle } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    department: '',
    year: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Google Login Handler
  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setGoogleLoading(true);
      try {
        // Get user info from Google
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${codeResponse.access_token}`
            }
          }
        );

        console.log('Google User Info:', userInfo.data);

        // Check if email domain is allowed
        const email = userInfo.data.email;
        const domain = email.split('@')[1];
        
        const allowedDomains = [
          'ritindia.edu',
          'walchandsangli.ac.in',
          'gcekarad.ac.in',
          'kitcoek.ac.in',
          'dkte.ac.in',
          'adcet.ac.in',
          'pvpit.ac.in',
          'amgoi.ac.in',
          'sanjayghodawatuniversity.ac.in',
          'gmail.com' // Remove this in production
        ];

        if (!allowedDomains.includes(domain)) {
          toast.error('Please use your college email address');
          setGoogleLoading(false);
          return;
        }

        // Auto-fill form with Google data
        setFormData({
          ...formData,
          name: userInfo.data.name || '',
          email: userInfo.data.email || ''
        });

        toast.success('Google sign-in successful! Please complete your profile.');
        setGoogleLoading(false);
      } catch (error) {
        console.error('Google login error:', error);
        toast.error('Google authentication failed. Please try again.');
        setGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error('Google login failed. Please try again.');
      setGoogleLoading(false);
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setTouched({ ...touched, [name]: true });
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.college) {
      newErrors.college = 'Please select your college';
    }
    if (!formData.department) {
      newErrors.department = 'Please select your department';
    }
    if (!formData.year) {
      newErrors.year = 'Please select your year';
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Must contain uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Must contain lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Must contain a number';
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
      newErrors.password = 'Must contain special character';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix all errors');
      return;
    }

    setLoading(true);
    try {
      // Send registration data to backend
      const { confirmPassword, ...userData } = formData;
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        toast.success('Registration successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    return { score, label: labels[score - 1] || '', color: colors[score - 1] || '' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const colleges = [
    'Walchand College of Engineering',
    'Government College of Engineering, Karad',
    "Kolhapur Institute of Technology's College of Engineering",
    "DKTE Society's Textile & Engineering Institute",
    'Rajarambapu Institute of Technology',
    'Annasaheb Dange College of Engineering & Technology',
    'Padmabhooshan Vasantdada Patil Institute of Technology',
    'Ashokrao Mane Group of Institutions',
    'Sanjay Ghodawat University'
  ];

  const departments = [
    'Computer Science and Engineering (CSE)',
    'Information Technology (IT)',
    'Artificial Intelligence and Machine Learning (AI & ML)',
    'Electronics and Telecommunication Engineering (ENTC)',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Robotics and Automation Engineering',
    'Mechatronics Engineering'
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="p-8 bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-2 space-x-2">
              <span className="text-2xl font-bold text-blue-600">Campus</span>
              <span className="text-2xl font-bold text-gray-800">Link</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Your Account</h1>
            <p className="mt-1 text-sm text-gray-500">Join India's Engineering Student Network</p>
          </div>

          {/* Google Login Button */}
          <button
            onClick={() => googleLogin()}
            disabled={googleLoading}
            className="flex items-center justify-center w-full px-4 py-3 space-x-3 transition-all border border-gray-200 shadow-sm rounded-xl hover:bg-gray-50 hover:shadow disabled:opacity-50"
          >
            {googleLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-t-2 border-blue-600 rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              <>
                <FaGoogle className="w-5 h-5 text-red-500" />
                <span className="font-medium text-gray-700">Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-gray-500 bg-white">or sign up with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.name && touched.name
                    ? 'border-red-300 focus:ring-red-500'
                    : touched.name && !errors.name
                    ? 'border-green-300 focus:ring-green-500'
                    : 'border-gray-200 focus:ring-blue-500'
                }`}
              />
              {errors.name && touched.name && (
                <p className="flex items-center mt-1 text-sm text-red-600">
                  <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@college.edu"
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.email && touched.email
                    ? 'border-red-300 focus:ring-red-500'
                    : touched.email && !errors.email
                    ? 'border-green-300 focus:ring-green-500'
                    : 'border-gray-200 focus:ring-blue-500'
                }`}
              />
              {errors.email && touched.email && (
                <p className="flex items-center mt-1 text-sm text-red-600">
                  <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* College */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                College
              </label>
              <select
                name="college"
                value={formData.college}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.college && touched.college
                    ? 'border-red-300 focus:ring-red-500'
                    : touched.college && !errors.college
                    ? 'border-green-300 focus:ring-green-500'
                    : 'border-gray-200 focus:ring-blue-500'
                }`}
              >
                <option value="">Select your college</option>
                {colleges.map((college) => (
                  <option key={college} value={college}>{college}</option>
                ))}
              </select>
              {errors.college && touched.college && (
                <p className="flex items-center mt-1 text-sm text-red-600">
                  <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                  {errors.college}
                </p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.department && touched.department
                    ? 'border-red-300 focus:ring-red-500'
                    : touched.department && !errors.department
                    ? 'border-green-300 focus:ring-green-500'
                    : 'border-gray-200 focus:ring-blue-500'
                }`}
              >
                <option value="">Select your department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && touched.department && (
                <p className="flex items-center mt-1 text-sm text-red-600">
                  <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                  {errors.department}
                </p>
              )}
            </div>

            {/* Year */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Year
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.year && touched.year
                    ? 'border-red-300 focus:ring-red-500'
                    : touched.year && !errors.year
                    ? 'border-green-300 focus:ring-green-500'
                    : 'border-gray-200 focus:ring-blue-500'
                }`}
              >
                <option value="">Select your year</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              {errors.year && touched.year && (
                <p className="flex items-center mt-1 text-sm text-red-600">
                  <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                  {errors.year}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all pr-12 ${
                    errors.password && touched.password
                      ? 'border-red-300 focus:ring-red-500'
                      : formData.password && !errors.password
                      ? 'border-green-300 focus:ring-green-500'
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Bar */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} rounded-full transition-all duration-500`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-500">
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
              
              {errors.password && touched.password && (
                <p className="flex items-center mt-1 text-sm text-red-600">
                  <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all pr-12 ${
                    errors.confirmPassword && touched.confirmPassword
                      ? 'border-red-300 focus:ring-red-500'
                      : formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword
                      ? 'border-green-300 focus:ring-green-500'
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
                <p className="flex items-center mt-1 text-sm text-green-600">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Passwords match
                </p>
              )}
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="flex items-center mt-1 text-sm text-red-600">
                  <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 transition-colors hover:text-blue-700">
                Sign in
              </Link>
            </p>
          </div>

          {/* Terms */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              By signing up, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;