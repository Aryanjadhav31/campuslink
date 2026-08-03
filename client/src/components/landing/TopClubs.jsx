import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    if (!name) return 'bg-[#0095F6]';
    const colors = [
      'bg-[#0095F6]', 'bg-purple-600', 'bg-emerald-600', 
      'bg-pink-600', 'bg-orange-600', 'bg-rose-600',
      'bg-indigo-600', 'bg-teal-600', 'bg-amber-600'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="p-6 bg-[#121212] border border-[#262626] rounded-2xl text-white">
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-t-2 border-b-2 border-[#0095F6] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#121212] border border-[#262626] rounded-2xl text-white">
      <div className="flex items-center justify-between mb-5">
        <h3 className="flex items-center text-lg font-bold text-white">
          <TrophyIcon className="w-5 h-5 mr-2 text-amber-400" />
          Top Rated Clubs
        </h3>
        <Link to="/communities" className="flex items-center text-sm font-semibold text-[#0095F6] hover:underline">
          View All
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {clubs.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-zinc-500">No clubs available</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
          {clubs.map((club) => (
            <div key={club.id || club._id} className="p-3 bg.1c1c1e bg-[#18181b] border border-[#26262a] rounded-xl hover:border-[#383838] transition-all group">
              <div className="flex items-center space-x-3">
                <div className={`w-11 h-11 ${getColor(club.name)} rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0`}>
                  {getInitials(club.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white truncate text-sm">{club.name || 'Club'}</h4>
                    <div className="flex items-center text-xs text-amber-400">
                      <StarIcon className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="ml-1 font-semibold">{club.rating?.toFixed(1) || '4.5'}</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">{club.description || 'No description'}</p>
                  <div className="flex items-center mt-1.5 space-x-3 text-[11px] text-zinc-500">
                    <span className="flex items-center">
                      <UserGroupIcon className="w-3 h-3 mr-1" />
                      {formatNumber(club.members || 0)} members
                    </span>
                    <span className="flex items-center">
                      <BuildingOfficeIcon className="w-3 h-3 mr-1" />
                      {club.college || 'Multiple'}
                    </span>
                    <span className="px-2 py-0.5 bg-[#26262a] text-zinc-300 rounded-md">{club.category || 'General'}</span>
                  </div>
                </div>
                <button className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0095F6] hover:bg-[#1877F2] rounded-xl transition-all cursor-pointer whitespace-nowrap">
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