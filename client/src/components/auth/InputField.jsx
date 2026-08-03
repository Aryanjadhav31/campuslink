import React from 'react';

const InputField = ({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  autoComplete,
  className = ''
}) => {
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

      <input
        id={id}
        name={name}
        type={type}
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
          } px-4 focus:outline-none transition-all duration-150 ${className}`}
      />

      {error && (
        <p id={`${id}-error`} className="text-xs text-red-400 mt-1 font-normal">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;

