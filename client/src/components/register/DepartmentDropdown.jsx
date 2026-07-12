import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

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

const DepartmentDropdown = ({ register, errors }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const dropdownRef = useRef(null);

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
        Department
      </label>
      <div
        className={`w-full px-4 py-2.5 border rounded-xl focus-within:ring-2 transition-all cursor-pointer flex items-center justify-between ${
          errors.department 
            ? 'border-red-300 focus-within:ring-red-500' 
            : selected
            ? 'border-green-300 focus-within:ring-green-500'
            : 'border-gray-200 focus-within:ring-blue-500'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected || 'Select Department'}
        </span>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-xl max-h-60">
          {departments.map((dept) => (
            <div
              key={dept}
              className="flex items-center justify-between px-4 py-2 transition-colors cursor-pointer hover:bg-blue-50"
              onClick={() => {
                setSelected(dept);
                setIsOpen(false);
                register('department').onChange({ target: { value: dept, name: 'department' } });
              }}
            >
              <span className="text-sm text-gray-700">{dept}</span>
              {selected === dept && <CheckIcon className="w-4 h-4 text-blue-600" />}
            </div>
          ))}
        </div>
      )}
      <input
        type="hidden"
        {...register('department')}
        value={selected}
      />
      {errors.department && (
        <p className="flex items-center mt-1 text-sm text-red-600">
          <ExclamationCircleIcon className="w-4 h-4 mr-1" />
          {errors.department.message}
        </p>
      )}
    </div>
  );
};

export default DepartmentDropdown;