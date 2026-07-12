import React from 'react';
import { motion } from 'framer-motion';

const PasswordStrength = ({ password }) => {
  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const getStrengthLabel = (score) => {
    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return labels[Math.min(score, 4)];
  };

  const getStrengthColor = (score) => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    return colors[Math.min(score, 4)];
  };

  const score = calculateStrength(password || '');

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-2"
    >
      <div className="flex items-center space-x-2">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(score / 5) * 100}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full ${getStrengthColor(score)} rounded-full`}
          />
        </div>
        <span className="text-xs font-medium text-gray-500">
          {password ? getStrengthLabel(score) : ''}
        </span>
      </div>
    </motion.div>
  );
};

export default PasswordStrength;