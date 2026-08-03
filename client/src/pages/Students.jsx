import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    college: '',
    department: '',
    year: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/users');
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.college) params.append('college', filters.college);
      if (filters.department) params.append('department', filters.department);
      if (filters.year) params.append('year', filters.year);

      const { data } = await axios.get(`http://localhost:5000/api/users?${params}`);
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error searching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const studentsArray = Array.isArray(students) ? students : [];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 space-x-2 transition-colors bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-zinc-300 rounded-lg hover:bg-gray-200 dark:hover:bg-[#262626]"
          >
            <FunnelIcon className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 mb-6 bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#1F1F1F] shadow-sm rounded-xl">
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search students by name or email..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500 absolute left-3 top-2.5" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-2 text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-[#1A1A1A] rounded-lg hover:bg-gray-200 dark:hover:bg-[#262626] transition-colors"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-[#1F1F1F] md:grid-cols-3">
              <input
                type="text"
                placeholder="College"
                value={filters.college}
                onChange={(e) => setFilters({ ...filters, college: e.target.value })}
                className="px-4 py-2 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Department"
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="px-4 py-2 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                className="px-4 py-2 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Years</option>
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
                <option value="5th">5th Year</option>
              </select>
            </div>
          )}
        </div>

        {/* Student Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : studentsArray.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#1F1F1F] shadow-sm rounded-xl">
            <div className="mb-4 text-5xl">🔍</div>
            <p className="text-lg text-gray-500 dark:text-zinc-400">No students found</p>
            <p className="mt-1 text-sm text-gray-400 dark:text-zinc-500">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {studentsArray.map((student) => (
              <Link
                key={student._id}
                to={`/students/${student._id}`}
                className="p-6 transition-all duration-200 bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#1F1F1F] text-gray-900 dark:text-white shadow-sm rounded-xl hover:shadow-lg hover:transform hover:-translate-y-1"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={student.profileImage || 'https://via.placeholder.com/60'}
                    alt={student.name}
                    className="object-cover border-2 border-gray-100 dark:border-[#262626] rounded-full h-14 w-14"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/60'}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold truncate text-gray-900 dark:text-white">{student.name || 'User'}</h3>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 truncate">{student.college || 'College'}</p>
                    <p className="text-sm text-gray-500 dark:text-zinc-500 truncate">{student.department || 'Department'}</p>
                    {student.skills && student.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {student.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="px-2 py-1 text-xs text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                            {skill}
                          </span>
                        ))}
                        {student.skills.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-zinc-500">+{student.skills.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Students;