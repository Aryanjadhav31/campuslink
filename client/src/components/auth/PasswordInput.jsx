import React, { useState } from 'react';

const PasswordInput = ({
  id = 'password',
  name = 'password',
  label,
  value,
  onChange,
  placeholder = 'Password',
  error,
  required = false,
  autoComplete = 'current-password',
  className = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col space-y-1.5 w-full text-left">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-zinc-300 uppercase tracking-wider"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full h-[46px] bg-[#121212] text-white text-sm placeholder-zinc-500 rounded-xl border ${error
              ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-[#262626] focus:border-[#0095F6] focus:ring-1 focus:ring-[#0095F6]'
            } pl-4 pr-16 focus:outline-none transition-all duration-150 ${className}`}
        />

        <button
          type="button"
          onClick={() => setShowPassword(prev => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-3.5 text-xs text-zinc-400 hover:text-white focus:outline-none p-1 transition-colors select-none font-semibold cursor-pointer"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>

      {error && (
        <p id={`${id}-error`} className="text-xs text-red-400 mt-1 font-normal">
          {error}
        </p>
      )}
    </div>
  );
};

export default PasswordInput;

