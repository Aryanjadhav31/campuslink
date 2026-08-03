import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('campuslink-theme');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      console.error('Theme initialization error:', e);
    }
    return 'dark'; // Fallback default
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    console.log('🎨 ThemeContext applying theme:', theme);

    root.setAttribute('data-theme', theme);
    if (body) body.setAttribute('data-theme', theme);

    if (theme === 'dark') {
      root.classList.add('dark');
      if (body) body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      if (body) body.classList.remove('dark');
    }

    try {
      localStorage.setItem('campuslink-theme', theme);
    } catch (e) {
      console.error('Error saving theme to localStorage:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prevTheme) => {
      const nextTheme = prevTheme === 'dark' ? 'light' : 'dark';
      console.log(`🔄 Toggling theme from "${prevTheme}" to "${nextTheme}"`);

      // Sync to backend if token exists
      const token = localStorage.getItem('token');
      if (token) {
        axios.put('http://localhost:5000/api/users/profile', { themePreference: nextTheme })
          .catch(() => {});
      }

      return nextTheme;
    });
  };

  const setTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setThemeState(newTheme);
    }
  };

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
