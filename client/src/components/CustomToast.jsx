import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  CheckIcon, 
  XMarkIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  MoonIcon, 
  SunIcon 
} from '@heroicons/react/24/outline';

const CustomToast = ({ t, type = 'success', title, message, duration = 3000, themeMode }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Icon & Theme Configurations
  const getToastConfig = () => {
    switch (type) {
      case 'error':
        return {
          icon: <XMarkIcon className="w-5 h-5 text-red-400" />,
          badgeBg: 'bg-red-500/15 border-red-500/30',
          barBg: 'bg-red-500',
          defaultTitle: 'Error'
        };
      case 'warning':
        return {
          icon: <ExclamationTriangleIcon className="w-5 h-5 text-amber-400" />,
          badgeBg: 'bg-amber-500/15 border-amber-500/30',
          barBg: 'bg-amber-500',
          defaultTitle: 'Warning'
        };
      case 'info':
        return {
          icon: <InformationCircleIcon className="w-5 h-5 text-blue-400" />,
          badgeBg: 'bg-blue-500/15 border-blue-500/30',
          barBg: 'bg-blue-500',
          defaultTitle: 'Notice'
        };
      case 'theme':
        return {
          icon: themeMode === 'light' ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5 text-blue-400" />,
          badgeBg: themeMode === 'light' ? 'bg-amber-500/15 border-amber-500/30' : 'bg-blue-500/15 border-blue-500/30',
          barBg: themeMode === 'light' ? 'bg-amber-500' : 'bg-blue-500',
          defaultTitle: themeMode === 'light' ? 'Light Mode' : 'Dark Mode'
        };
      case 'success':
      default:
        return {
          icon: <CheckIcon className="w-5 h-5 text-emerald-400" />,
          badgeBg: 'bg-emerald-500/15 border-emerald-500/30',
          barBg: 'bg-emerald-500',
          defaultTitle: 'Success'
        };
    }
  };

  const config = getToastConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.94 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full sm:w-[340px] p-4 bg-[#141414]/90 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.35)] rounded-[18px] text-white flex items-start space-x-3.5 pointer-events-auto overflow-hidden group select-none"
    >
      {/* Left Circular Badge */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center border shrink-0 ${config.badgeBg}`}>
        {config.icon}
      </div>

      {/* Content Center */}
      <div className="flex-1 min-w-0 pr-4">
        <h4 className="text-[15px] font-bold text-white leading-tight truncate">
          {title || config.defaultTitle}
        </h4>
        {message && (
          <p className="text-[13px] text-gray-400 leading-snug mt-0.5 whitespace-pre-line">
            {message}
          </p>
        )}
      </div>

      {/* Manual Dismiss Button */}
      <button
        onClick={() => toast.dismiss(t.id)}
        className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0 cursor-pointer focus:outline-none"
        title="Dismiss"
        aria-label="Dismiss notification"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>

      {/* Animated Bottom Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/[0.06] overflow-hidden">
        <div
          className={`h-full ${config.barBg} transition-all`}
          style={{
            width: '100%',
            animation: `shrinkWidth ${duration}ms linear forwards`,
            animationPlayState: isHovered ? 'paused' : 'running'
          }}
        />
      </div>

      {/* CSS Animation Keyframes for Progress Bar */}
      <style>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </motion.div>
  );
};

export default CustomToast;
