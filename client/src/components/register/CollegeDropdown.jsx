import React, { useState, useRef, useEffect } from 'react';
import { BuildingOfficeIcon, CheckIcon, MagnifyingGlassIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { APPROVED_COLLEGES } from '../../constants/colleges';

const colleges = APPROVED_COLLEGES;

const CollegeDropdown = ({ register, errors }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('');
  const dropdownRef = useRef(null);

  const filteredColleges = colleges.filter(college =>
    college.toLowerCase().includes(search.toLowerCase())
  );

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
        College
      </label>
      <div
        className={`w-full px-4 py-2.5 border rounded-xl focus-within:ring-2 transition-all cursor-pointer ${
          errors.college 
            ? 'border-red-300 focus-within:ring-red-500' 
            : selected
            ? 'border-green-300 focus-within:ring-green-500'
            : 'border-gray-200 focus-within:ring-blue-500'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <BuildingOfficeIcon className="w-5 h-5 mr-2 text-gray-400" />
          {selected ? (
            <span className="text-gray-900">{selected}</span>
          ) : (
            <span className="text-gray-400">Search your college</span>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl max-h-60">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search colleges..."
                className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-48">
            {filteredColleges.length === 0 ? (
              <div className="p-4 text-sm text-center text-gray-500">
                No colleges found
              </div>
            ) : (
              filteredColleges.map((college) => (
                <div
                  key={college}
                  className="flex items-center justify-between px-4 py-2 transition-colors cursor-pointer hover:bg-blue-50"
                  onClick={() => {
                    setSelected(college);
                    setIsOpen(false);
                    register('college').onChange({ target: { value: college, name: 'college' } });
                  }}
                >
                  <span className="text-sm text-gray-700">{college}</span>
                  {selected === college && (
                    <CheckIcon className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      <input
        type="hidden"
        {...register('college')}
        value={selected}
      />
      {errors.college && (
        <p className="flex items-center mt-1 text-sm text-red-600">
          <ExclamationCircleIcon className="w-4 h-4 mr-1" />
          {errors.college.message}
        </p>
      )}
    </div>
  );
};

export default CollegeDropdown;