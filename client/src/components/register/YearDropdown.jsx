import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const YearDropdown = ({ register, errors }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const dropdownRef = useRef(null);

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        Year
      </label>
      <div
        className={`w-full px-4 py-2.5 border rounded-xl focus-within:ring-2 transition-all cursor-pointer flex items-center justify-between ${
          errors.year 
            ? 'border-red-300 focus-within:ring-red-500' 
            : selected
            ? 'border-green-300 focus-within:ring-green-500'
            : 'border-gray-200 focus-within:ring-blue-500'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected || 'Select Year'}
        </span>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 shadow-lg rounded-xl">
          {years.map((year) => (
            <div
              key={year}
              className="flex items-center justify-between px-4 py-2 transition-colors cursor-pointer hover:bg-blue-50"
              onClick={() => {
                setSelected(year);
                setIsOpen(false);
                register('year').onChange({ target: { value: year, name: 'year' } });
              }}
            >
              <span className="text-sm text-gray-700">{year}</span>
              {selected === year && <CheckIcon className="w-4 h-4 text-blue-600" />}
            </div>
          ))}
        </div>
      )}
      <input
        type="hidden"
        {...register('year')}
        value={selected}
      />
      {errors.year && (
        <p className="flex items-center mt-1 text-sm text-red-600">
          <ExclamationCircleIcon className="w-4 h-4 mr-1" />
          {errors.year.message}
        </p>
      )}
    </div>
  );
};

export default YearDropdown;