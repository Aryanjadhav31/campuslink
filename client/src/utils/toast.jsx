import React from 'react';
import toast from 'react-hot-toast';
import CustomToast from '../components/CustomToast';

// Store active toast IDs by unique content key to prevent duplicates
const activeToasts = new Map();

/**
 * Global Deduplicated Toast Utility
 */
export const notify = {
  success: (title, message, options = {}) => {
    return showToast({ type: 'success', title, message, duration: 3000, ...options });
  },

  error: (title, message, options = {}) => {
    return showToast({ type: 'error', title, message, duration: 5000, ...options });
  },

  warning: (title, message, options = {}) => {
    return showToast({ type: 'warning', title, message, duration: 4000, ...options });
  },

  info: (title, message, options = {}) => {
    return showToast({ type: 'info', title, message, duration: 3000, ...options });
  },

  theme: (title, message, themeMode = 'dark', options = {}) => {
    return showToast({ type: 'theme', title, message, themeMode, duration: 3000, ...options });
  },

  dismiss: (id) => {
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
      activeToasts.clear();
    }
  }
};

const showToast = ({ type = 'success', title, message, duration = 3000, themeMode, id }) => {
  // Normalize parameters for single vs double string calls
  let mainTitle = title;
  let subMessage = message;

  if (typeof title === 'object' && title !== null) {
    mainTitle = title.title || 'Notification';
    subMessage = title.message || '';
  } else if (!subMessage && typeof title === 'string') {
    // Single string call e.g. notify.success("Profile saved successfully!")
    if (title.length > 30) {
      mainTitle = type.charAt(0).toUpperCase() + type.slice(1);
      subMessage = title;
    } else {
      mainTitle = title;
      subMessage = '';
    }
  }

  // Always dismiss any active toasts first to ensure ONLY ONE toast is visible on screen
  toast.dismiss();
  activeToasts.clear();

  // Create unique key to prevent duplicate toasts
  const toastKey = id || `${type}:${mainTitle}:${subMessage || ''}`;

  const toastId = toast.custom(
    (t) => (
      <CustomToast
        t={t}
        type={type}
        title={mainTitle}
        message={subMessage}
        duration={duration}
        themeMode={themeMode}
      />
    ),
    {
      id: toastKey,
      duration,
      position: 'top-right'
    }
  );

  activeToasts.set(toastKey, toastId);

  setTimeout(() => {
    if (activeToasts.get(toastKey) === toastId) {
      activeToasts.delete(toastKey);
    }
  }, duration + 300);

  return toastId;
};

export default notify;
