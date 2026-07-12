import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // ✅ ADD THIS IMPORT
import axios from 'axios';
import { 
  TrophyIcon,
  UserGroupIcon,
  StarIcon,
  BuildingOfficeIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const TopClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/dashboard/top-clubs');
      setClubs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      setClubs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  const getInitials = (name) => {
    if (!name) return 'CL';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getColor = (name) => {
    if (!name) return 'bg-blue-500';
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-green-500', 
      'bg-pink-500', 'bg-orange-500', 'bg-red-500',
      'bg-indigo-500', 'bg-teal-500', 'bg-amber-500',
      'bg-cyan-500'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
      <div className="flex items-center justify-between mb-5">
        <h3 className="flex items-center text-lg font-semibold text-gray-900">
          <TrophyIcon className="w-5 h-5 mr-2 text-amber-500" />
          Top Rated Clubs
        </h3>
        <Link to="/communities" className="flex items-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">
          View All
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {clubs.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-400">No clubs available</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
          {clubs.map((club) => (
            <div key={club.id || club._id} className="p-3 transition-all bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-md group">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 ${getColor(club.name)} rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                  {getInitials(club.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 truncate">{club.name || 'Club'}</h4>
                    <div className="flex items-center text-sm text-amber-500">
                      <StarIcon className="w-4 h-4 fill-current" />
                      <span className="ml-1 font-medium">{club.rating?.toFixed(1) || '4.5'}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{club.description || 'No description'}</p>
                  <div className="flex items-center mt-1 space-x-3 text-xs text-gray-400">
                    <span className="flex items-center">
                      <UserGroupIcon className="w-3 h-3 mr-1" />
                      {formatNumber(club.members || 0)} members
                    </span>
                    <span className="flex items-center">
                      <BuildingOfficeIcon className="w-3 h-3 mr-1" />
                      {club.college || 'Multiple'}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-200 rounded-full">{club.category || 'General'}</span>
                  </div>
                </div>
                <button className="px-4 py-1.5 text-sm font-medium text-white transition-all bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-lg hover:scale-105 shadow-blue-500/25 whitespace-nowrap">
                  Join
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopClubs;