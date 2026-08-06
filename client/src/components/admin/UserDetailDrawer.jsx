import React, { useState, useEffect } from 'react';
import { admin as adminApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  XMarkIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  CalendarIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const UserDetailDrawer = ({ userId, isOpen, onClose }) => {
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({ postsCount: 0, friendsCount: 0, notificationsCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      fetchDetails();
    } else {
      setUserData(null);
    }
  }, [isOpen, userId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getUserDetails(userId);
      setUserData(data.user);
      setStats(data.stats || { postsCount: 0, friendsCount: 0, notificationsCount: 0 });
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isSuperAdminUser = userData?.email && (userData.email.toLowerCase().includes('aryan') || userData.email.toLowerCase().includes('admin.campuslink'));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#111111] border-l border-[#1F1F1F] shadow-2xl flex flex-col text-white">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#1F1F1F] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">User Profile</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1F1F1F] transition cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {loading ? (
              <div className="py-20 text-center space-y-2">
                <div className="w-6 h-6 mx-auto border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-xs text-gray-400">Loading user profile...</p>
              </div>
            ) : !userData ? (
              <p className="text-xs text-center text-gray-500">User record not found</p>
            ) : (
              <>
                {/* User Hero */}
                <div className="flex items-center space-x-4 pb-2 border-b border-[#1F1F1F]">
                  <img
                    src={userData.profileImage || 'https://via.placeholder.com/64'}
                    alt={userData.name}
                    className="w-16 h-16 rounded-full object-cover border border-[#262626]"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/64'}
                  />
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {userData.name}
                      {isSuperAdminUser && (
                        <LockClosedIcon className="w-4 h-4 text-purple-400" title="Primary Administrator" />
                      )}
                    </h3>
                    <p className="text-xs text-gray-400">@{userData.username || userData.name.toLowerCase().replace(/\s+/g, '_')}</p>
                    
                    {/* Role & Verification Badges */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                        isSuperAdminUser || userData.role === 'admin'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {isSuperAdminUser || userData.role === 'admin' ? 'Admin' : 'Student'}
                      </span>

                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                        userData.isVerified !== false
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {userData.isVerified !== false ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Details List */}
                <div className="space-y-3 text-xs">
                  <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Academic Profile</h4>
                  
                  <div className="space-y-2.5 text-gray-300">
                    <div className="flex items-center justify-between py-1.5 border-b border-[#1A1A1A]">
                      <span className="flex items-center text-gray-400"><EnvelopeIcon className="w-4 h-4 mr-2 text-gray-500" /> Email</span>
                      <span className="font-medium text-white">{userData.email}</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-[#1A1A1A]">
                      <span className="flex items-center text-gray-400"><BuildingOfficeIcon className="w-4 h-4 mr-2 text-gray-500" /> College</span>
                      <span className="font-medium text-white max-w-[200px] truncate text-right">{userData.college || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-[#1A1A1A]">
                      <span className="flex items-center text-gray-400"><AcademicCapIcon className="w-4 h-4 mr-2 text-gray-500" /> Department</span>
                      <span className="font-medium text-white">{userData.department}</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-[#1A1A1A]">
                      <span className="flex items-center text-gray-400"><CalendarIcon className="w-4 h-4 mr-2 text-gray-500" /> Academic Year</span>
                      <span className="font-medium text-white">{userData.year}</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5">
                      <span className="flex items-center text-gray-400"><CalendarIcon className="w-4 h-4 mr-2 text-gray-500" /> Account Created</span>
                      <span className="font-medium text-white">{new Date(userData.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Metrics */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Recent Activity</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#161616] border border-[#262626] rounded-xl text-center">
                      <DocumentTextIcon className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                      <p className="text-base font-bold text-white">{stats.postsCount}</p>
                      <p className="text-[10px] text-gray-400">Total Posts</p>
                    </div>
                    <div className="p-3 bg-[#161616] border border-[#262626] rounded-xl text-center">
                      <UserGroupIcon className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
                      <p className="text-base font-bold text-white">{stats.friendsCount}</p>
                      <p className="text-[10px] text-gray-400 font-medium">Friends</p>
                    </div>
                  </div>
                </div>

              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailDrawer;
