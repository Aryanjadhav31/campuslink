import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import GoogleButton from '../auth/GoogleButton';
import Divider from '../auth/Divider';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

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
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Full name must be at least 3 characters';
    }
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.college) {
      newErrors.college = 'Please select your college';
    }
    if (!formData.department) {
      newErrors.department = 'Please select your department';
    }
    if (!formData.year) {
      newErrors.year = 'Please select your academic year';
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    try {
      const normalizedYear = formData.year.replace(' Year', '');
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        college: formData.college,
        department: formData.department,
        year: normalizedYear
      };

      const res = await registerUser(userData);
      if (res?.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const selectClassName = (fieldName) => `w-full px-3.5 py-2.5 bg-[#121212] text-white text-sm rounded-xl border ${
    errors[fieldName] && touched[fieldName] 
      ? 'border-red-500' 
      : 'border-[#262626] focus:border-[#0095F6] focus:ring-1 focus:ring-[#0095F6]'
  } focus:outline-none transition-colors cursor-pointer`;

  const inputClassName = (fieldName) => `w-full px-3.5 py-2.5 bg-[#121212] text-white text-sm placeholder-zinc-500 rounded-xl border ${
    errors[fieldName] && touched[fieldName] 
      ? 'border-red-500' 
      : 'border-[#262626] focus:border-[#0095F6] focus:ring-1 focus:ring-[#0095F6]'
  } focus:outline-none transition-colors`;

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="text-left">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Create account on CampusLink
        </h2>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3 text-left">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className={inputClassName('name')}
          />
          {errors.name && touched.name && (
            <p className="text-xs text-red-400 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="College email address"
            className={inputClassName('email')}
          />
          {errors.email && touched.email && (
            <p className="text-xs text-red-400 mt-1">{errors.email}</p>
          )}
        </div>

        {/* College Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
            College
          </label>
          <select
            name="college"
            value={formData.college}
            onChange={handleChange}
            className={selectClassName('college')}
          >
            <option value="" className="bg-[#121212] text-zinc-400">Select college</option>
            {colleges.map((c) => (
              <option key={c} value={c} className="bg-[#121212] text-white">{c}</option>
            ))}
          </select>
          {errors.college && touched.college && (
            <p className="text-xs text-red-400 mt-1">{errors.college}</p>
          )}
        </div>

        {/* Department & Academic Year Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={selectClassName('department')}
            >
              <option value="" className="bg-[#121212] text-zinc-400">Department</option>
              {departments.map((d) => (
                <option key={d} value={d} className="bg-[#121212] text-white">{d}</option>
              ))}
            </select>
            {errors.department && touched.department && (
              <p className="text-xs text-red-400 mt-1">{errors.department}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Academic Year
            </label>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className={selectClassName('year')}
            >
              <option value="" className="bg-[#121212] text-zinc-400">Year</option>
              {years.map((y) => (
                <option key={y} value={y} className="bg-[#121212] text-white">{y}</option>
              ))}
            </select>
            {errors.year && touched.year && (
              <p className="text-xs text-red-400 mt-1">{errors.year}</p>
            )}
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className={`${inputClassName('password')} pr-14`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white font-semibold focus:outline-none"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && touched.password && (
            <p className="text-xs text-red-400 mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className={`${inputClassName('confirmPassword')} pr-14`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white font-semibold focus:outline-none"
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
            <p className="text-xs text-emerald-400 mt-1 flex items-center">
              <CheckCircleIcon className="w-3.5 h-3.5 mr-1" /> Passwords match
            </p>
          )}
          {errors.confirmPassword && touched.confirmPassword && (
            <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-[44px] mt-3 bg-[#0095F6] hover:bg-[#1877F2] active:bg-[#0074CC] text-white font-semibold text-sm rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Creating Account...</span>
            </div>
          ) : (
            <span>Create account</span>
          )}
        </button>
      </form>

      <Divider text="OR" />

      {/* Google Button */}
      <GoogleButton isLoading={isLoading} />

      {/* Footer Link */}
      <div className="text-center pt-3 border-t border-[#262626] text-sm text-zinc-400">
        Have an account?{' '}
        <Link to="/login" className="font-semibold text-[#0095F6] hover:underline transition-colors">
          Log in
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;