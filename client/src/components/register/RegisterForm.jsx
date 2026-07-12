import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EyeIcon, 
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import CollegeDropdown from './CollegeDropdown';
import DepartmentDropdown from './DepartmentDropdown';
import YearDropdown from './YearDropdown';
import PasswordStrength from './PasswordStrength';
import GoogleLoginButton from './GoogleLoginButton';

// ✅ Validation Schema
const registerSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Only alphabets and spaces allowed'),
  email: z.string()
    .email('Invalid email address')
    .refine((email) => {
      const allowedDomains = [
        'ritindia.edu',
        'walchandsangli.ac.in',
        'gcekarad.ac.in',
        'kitcoek.ac.in',
        'dkte.ac.in',
        'adcet.ac.in',
        'pvpit.ac.in',
        'amgoi.ac.in',
        'sanjayghodawatuniversity.ac.in'
      ];
      const domain = email.split('@')[1];
      return allowedDomains.includes(domain);
    }, 'Please use your college email address'),
  college: z.string().min(1, 'Please select your college'),
  department: z.string().min(1, 'Please select your department'),
  year: z.string().min(1, 'Please select your year'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, touchedFields } } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange'
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const email = watch('email');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSuccess(true);
      setTimeout(() => {}, 1500);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordValidation = () => {
    const checks = {
      length: password?.length >= 8,
      uppercase: /[A-Z]/.test(password || ''),
      lowercase: /[a-z]/.test(password || ''),
      number: /[0-9]/.test(password || ''),
      special: /[^A-Za-z0-9]/.test(password || '')
    };
    return checks;
  };

  const passwordChecks = getPasswordValidation();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <GoogleLoginButton />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 text-gray-500 bg-white">or</span>
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          {...register('name')}
          type="text"
          placeholder="Enter your full name"
          className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
            errors.name 
              ? 'border-red-300 focus:ring-red-500' 
              : touchedFields.name && !errors.name
              ? 'border-green-300 focus:ring-green-500'
              : 'border-gray-200 focus:ring-blue-500'
          }`}
        />
        <AnimatePresence>
          {errors.name && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center mt-1 text-sm text-red-600"
            >
              <ExclamationCircleIcon className="w-4 h-4 mr-1" />
              {errors.name.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Email */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          {...register('email')}
          type="email"
          placeholder="your.email@college.edu"
          className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
            errors.email 
              ? 'border-red-300 focus:ring-red-500' 
              : touchedFields.email && !errors.email
              ? 'border-green-300 focus:ring-green-500'
              : 'border-gray-200 focus:ring-blue-500'
          }`}
        />
        <AnimatePresence>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center mt-1 text-sm text-red-600"
            >
              <ExclamationCircleIcon className="w-4 h-4 mr-1" />
              {errors.email.message}
            </motion.p>
          )}
        </AnimatePresence>
        {email && !errors.email && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center mt-1 text-sm text-green-600"
          >
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            Valid college email
          </motion.p>
        )}
      </div>

      {/* College */}
      <CollegeDropdown register={register} errors={errors} />

      {/* Department */}
      <DepartmentDropdown register={register} errors={errors} />

      {/* Year */}
      <YearDropdown register={register} errors={errors} />

      {/* Password */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all pr-12 ${
              errors.password 
                ? 'border-red-300 focus:ring-red-500' 
                : password && !errors.password
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

        {password && <PasswordStrength password={password} />}

        <AnimatePresence>
          {password && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-1"
            >
              {Object.entries({
                length: 'At least 8 characters',
                uppercase: 'One uppercase letter',
                lowercase: 'One lowercase letter',
                number: 'One number',
                special: 'One special character'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center text-sm">
                  {passwordChecks[key] ? (
                    <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 mr-2 text-gray-300" />
                  )}
                  <span className={passwordChecks[key] ? 'text-green-600' : 'text-gray-500'}>
                    {label}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center mt-1 text-sm text-red-600"
            >
              <ExclamationCircleIcon className="w-4 h-4 mr-1" />
              {errors.password.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <div className="relative">
          <input
            {...register('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter your password"
            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all pr-12 ${
              errors.confirmPassword 
                ? 'border-red-300 focus:ring-red-500' 
                : confirmPassword && !errors.confirmPassword && password === confirmPassword
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
        <AnimatePresence>
          {confirmPassword && password === confirmPassword && !errors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center mt-1 text-sm text-green-600"
            >
              <CheckCircleIcon className="w-4 h-4 mr-1" />
              Passwords match
            </motion.p>
          )}
          {errors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center mt-1 text-sm text-red-600"
            >
              <ExclamationCircleIcon className="w-4 h-4 mr-1" />
              {errors.confirmPassword.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || isSuccess}
        className="w-full py-3 text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
            <span>Creating Account...</span>
          </div>
        ) : isSuccess ? (
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5" />
            <span>Account Created!</span>
          </div>
        ) : (
          <>
            <span>Create Account</span>
            <ArrowRightIcon className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};

export default RegisterForm;