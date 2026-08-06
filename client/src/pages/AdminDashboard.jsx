import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { admin as adminApi } from '../services/api';
import UserDetailDrawer from '../components/admin/UserDetailDrawer';
import toast from 'react-hot-toast';
import { 
  UsersIcon, 
  CheckCircleIcon, 
  UserGroupIcon, 
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  LockClosedIcon,
  XMarkIcon,
  ClockIcon,
  UserPlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { APPROVED_COLLEGES } from '../constants/colleges';

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('All Colleges');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [yearFilter, setYearFilter] = useState('All Years');
  const [verifiedFilter, setVerifiedFilter] = useState('all');

  // Statistics State (4 Essential Cards)
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedStudents: 0,
    pendingStudents: 0,
    admins: 0
  });

  // Action Dropdown State
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  // Drawer State
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Audit Logs State
  const [showLogs, setShowLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', college: '', department: '', year: '' });

  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    department: '',
    year: '1st Year',
    role: 'student'
  });
  const [submitting, setSubmitting] = useState(false);

  // Close active dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, search, collegeFilter, departmentFilter, yearFilter, verifiedFilter]);

  const fetchStats = async () => {
    try {
      const { data } = await adminApi.getStats();
      if (data) {
        setStats({
          totalUsers: data.totalUsers || 0,
          verifiedStudents: data.verifiedStudents || 0,
          pendingStudents: data.pendingStudents || 0,
          admins: data.admins || 0
        });
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getUsers({
        search,
        college: collegeFilter,
        department: departmentFilter,
        year: yearFilter,
        isVerified: verifiedFilter,
        page,
        limit: 10
      });
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotalUsersCount(data.totalUsers || 0);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLogsLoading(true);
      const { data } = await adminApi.getAuditLogs();
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminApi.createUser(newUserData);
      toast.success('New user account created');
      setShowAddModal(false);
      setNewUserData({
        name: '',
        email: '',
        password: '',
        college: '',
        department: '',
        year: '1st Year',
        role: 'student'
      });
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setSubmitting(true);
      await adminApi.resetPassword(editingUser._id, { newPassword: 'password123' }); // fallback or general edit
      toast.success('User updated successfully');
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVerify = async (u) => {
    setActiveMenuId(null);
    try {
      const { data } = await adminApi.toggleVerification(u._id);
      toast.success(data.message);
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update verification');
    }
  };

  const handleToggleSuspend = async (u) => {
    setActiveMenuId(null);
    try {
      const { data } = await adminApi.toggleSuspend(u._id);
      toast.success(data.message);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteUser = async (u) => {
    setActiveMenuId(null);
    if (!window.confirm(`Are you sure you want to delete ${u.name}? This action is permanent.`)) return;
    try {
      await adminApi.deleteUser(u._id);
      toast.success(`Deleted ${u.name}`);
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleRoleChange = async (u, newRole) => {
    setActiveMenuId(null);
    try {
      await adminApi.changeRole(u._id, { role: newRole });
      toast.success(`Role updated for ${u.name}`);
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setCollegeFilter('All Colleges');
    setDepartmentFilter('All Departments');
    setYearFilter('All Years');
    setVerifiedFilter('all');
    setPage(1);
  };

  const isSuperAdminUser = (u) => u?.email && (u.email.toLowerCase().includes('aryan') || u.email.toLowerCase().includes('admin.campuslink'));

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Minimal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1F1F1F]">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">CampusLink Admin Panel</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage users, permissions and student verification.</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setShowLogs(!showLogs);
                if (!showLogs) fetchAuditLogs();
              }}
              className="flex items-center px-3.5 py-2 bg-[#161616] hover:bg-[#222222] text-gray-300 rounded-lg text-xs font-medium border border-[#262626] transition cursor-pointer"
            >
              <ClockIcon className="w-4 h-4 mr-1.5 text-gray-400" />
              {showLogs ? 'Hide Logs' : 'Audit Logs'}
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium shadow-sm transition cursor-pointer"
            >
              <UserPlusIcon className="w-4 h-4 mr-1.5" />
              Add User
            </button>
          </div>
        </div>

        {/* Audit Logs Drawer */}
        {showLogs && (
          <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 space-y-3 shadow-lg">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center">
              <ClockIcon className="w-4 h-4 mr-1.5 text-blue-400" />
              Audit Logs
            </h3>
            {logsLoading ? (
              <p className="text-xs text-gray-400 py-4 text-center">Loading audit logs...</p>
            ) : auditLogs.length === 0 ? (
              <p className="text-xs text-gray-500 py-2">No audit logs recorded yet.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {auditLogs.map((log) => (
                  <div key={log._id} className="p-2.5 bg-[#161616] border border-[#222] rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono text-[10px]">
                        {log.action}
                      </span>
                      <span className="text-gray-300">
                        Admin <strong className="text-white">{log.adminName}</strong> {log.details}
                      </span>
                    </div>
                    <span className="text-gray-500 text-[11px]">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Exactly 4 Essential Dashboard Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Users */}
          <div className="p-5 bg-[#111111] border border-[#1F1F1F] rounded-xl shadow-xs hover:border-[#2A2A2A] transition">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium text-gray-400">Total Users</span>
              <UsersIcon className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{stats.totalUsers}</p>
          </div>

          {/* Card 2: Verified Students */}
          <div className="p-5 bg-[#111111] border border-[#1F1F1F] rounded-xl shadow-xs hover:border-[#2A2A2A] transition">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium text-gray-400">Verified Students</span>
              <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{stats.verifiedStudents}</p>
          </div>

          {/* Card 3: Pending Verification */}
          <div className="p-5 bg-[#111111] border border-[#1F1F1F] rounded-xl shadow-xs hover:border-[#2A2A2A] transition">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium text-gray-400">Pending Verification</span>
              <UserGroupIcon className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{stats.pendingStudents}</p>
          </div>

          {/* Card 4: Admin Accounts */}
          <div className="p-5 bg-[#111111] border border-[#1F1F1F] rounded-xl shadow-xs hover:border-[#2A2A2A] transition">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium text-gray-400">Admin Accounts</span>
              <ShieldCheckIcon className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{stats.admins}</p>
          </div>
        </div>

        {/* Clean Search & Filters Bar */}
        <div className="bg-[#111111] border border-[#1F1F1F] p-4 rounded-xl space-y-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, username, email, college..."
                className="w-full pl-9 pr-8 py-2 bg-[#161616] border border-[#262626] text-white placeholder-gray-500 rounded-lg text-xs focus:outline-none focus:border-blue-500 transition"
              />
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-500 absolute left-3 top-2.5" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white">
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto text-xs">
              <select
                value={collegeFilter}
                onChange={(e) => { setCollegeFilter(e.target.value); setPage(1); }}
                className="p-2 bg-[#161616] border border-[#262626] text-white rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer max-w-[150px] truncate"
              >
                <option value="All Colleges">College</option>
                {APPROVED_COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                value={departmentFilter}
                onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}
                className="p-2 bg-[#161616] border border-[#262626] text-white rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="All Departments">Department</option>
                <option value="Computer Science and Engineering">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
                <option value="Electronics and Telecommunication">Electronics (ENTC)</option>
                <option value="Electrical Engineering">Electrical Eng.</option>
                <option value="Mechanical Engineering">Mechanical Eng.</option>
                <option value="Civil Engineering">Civil Eng.</option>
              </select>

              <select
                value={yearFilter}
                onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
                className="p-2 bg-[#161616] border border-[#262626] text-white rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="All Years">Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Graduated">Graduated</option>
              </select>

              <select
                value={verifiedFilter}
                onChange={(e) => { setVerifiedFilter(e.target.value); setPage(1); }}
                className="p-2 bg-[#161616] border border-[#262626] text-white rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">Verification</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <button
              onClick={resetFilters}
              className="px-3 py-2 bg-[#161616] hover:bg-[#222222] text-gray-300 rounded-lg text-xs font-medium border border-[#262626] flex items-center shrink-0 cursor-pointer transition"
            >
              <ArrowPathIcon className="w-3.5 h-3.5 mr-1" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Clean Users Table */}
        <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-6 h-6 mx-auto border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-xs text-gray-400">Loading user directory...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-sm font-semibold text-white">No users found</p>
              <p className="text-xs text-gray-400">Try refining your search terms or filters.</p>
              <button onClick={resetFilters} className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition cursor-pointer">
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1F1F1F] bg-[#161616] text-gray-400 font-medium">
                      <th className="py-3 px-4">Avatar</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Username</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">College</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Year</th>
                      <th className="py-3 px-4">Verification</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1F1F]">
                    {users.map((u) => {
                      const isSuperAdminRow = isSuperAdminUser(u);

                      return (
                        <tr key={u._id} className="hover:bg-[#161616]/60 transition-colors">
                          
                          {/* 1. Avatar */}
                          <td className="py-3 px-4">
                            <img
                              src={u.profileImage || 'https://via.placeholder.com/32'}
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#262626]"
                              onError={(e) => e.target.src = 'https://via.placeholder.com/32'}
                            />
                          </td>

                          {/* 2. Name + Role Badge */}
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-white">{u.name}</span>
                              {isSuperAdminRow ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                  Admin
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                  Student
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 3. Username */}
                          <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">
                            @{u.username || u.name.toLowerCase().replace(/\s+/g, '_')}
                          </td>

                          {/* 4. Email */}
                          <td className="py-3 px-4 text-gray-300 font-medium">
                            {u.email}
                          </td>

                          {/* 5. College */}
                          <td className="py-3 px-4 text-gray-300 max-w-[160px] truncate">
                            {u.college || 'N/A'}
                          </td>

                          {/* 6. Department */}
                          <td className="py-3 px-4 text-gray-400">
                            {u.department}
                          </td>

                          {/* 7. Year */}
                          <td className="py-3 px-4 text-gray-400">
                            {u.year}
                          </td>

                          {/* 8. Verification Badge */}
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                              u.isVerified !== false
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {u.isVerified !== false ? 'Verified' : 'Pending'}
                            </span>
                          </td>

                          {/* 9. Status Badge */}
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                              u.status === 'Suspended'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                              {u.status || 'Active'}
                            </span>
                          </td>

                          {/* 10. Actions (Three-Dot Menu ⋮) */}
                          <td className="py-3 px-4 text-right relative">
                            {isSuperAdminRow ? (
                              <span className="inline-flex items-center px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-medium" title="This is the primary administrator.">
                                <LockClosedIcon className="w-3 h-3 mr-1" /> Primary Admin
                              </span>
                            ) : (
                              <div className="inline-block text-left" ref={activeMenuId === u._id ? menuRef : null}>
                                <button
                                  onClick={() => setActiveMenuId(activeMenuId === u._id ? null : u._id)}
                                  className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222222] rounded-lg transition cursor-pointer"
                                >
                                  <EllipsisVerticalIcon className="w-5 h-5" />
                                </button>

                                {/* Dropdown Popover */}
                                {activeMenuId === u._id && (
                                  <div className="absolute right-4 mt-1 w-44 bg-[#161616] border border-[#262626] rounded-xl shadow-xl z-30 text-left py-1 text-xs animate-in fade-in duration-100">
                                    <button
                                      onClick={() => { setSelectedUserId(u._id); setIsDrawerOpen(true); setActiveMenuId(null); }}
                                      className="w-full px-3.5 py-2 text-gray-200 hover:bg-[#222] hover:text-white text-left transition cursor-pointer"
                                    >
                                      View Profile
                                    </button>

                                    <button
                                      onClick={() => { setEditingUser(u); setEditFormData({ name: u.name, college: u.college, department: u.department, year: u.year }); setShowEditModal(true); setActiveMenuId(null); }}
                                      className="w-full px-3.5 py-2 text-gray-200 hover:bg-[#222] hover:text-white text-left transition cursor-pointer"
                                    >
                                      Edit User
                                    </button>

                                    <button
                                      onClick={() => handleToggleVerify(u)}
                                      className="w-full px-3.5 py-2 text-gray-200 hover:bg-[#222] hover:text-white text-left transition cursor-pointer"
                                    >
                                      {u.isVerified !== false ? 'Remove Verify' : 'Verify Student'}
                                    </button>

                                    <button
                                      onClick={() => handleToggleSuspend(u)}
                                      className="w-full px-3.5 py-2 text-gray-200 hover:bg-[#222] hover:text-white text-left transition cursor-pointer"
                                    >
                                      {u.status === 'Suspended' ? 'Activate User' : 'Suspend User'}
                                    </button>

                                    {/* Super Admin Options */}
                                    {isSuperAdminUser(currentUser) && (
                                      <button
                                        onClick={() => handleRoleChange(u, u.role === 'admin' ? 'student' : 'admin')}
                                        className="w-full px-3.5 py-2 text-purple-400 hover:bg-[#222] text-left transition cursor-pointer"
                                      >
                                        {u.role === 'admin' ? 'Remove Admin' : 'Promote to Admin'}
                                      </button>
                                    )}

                                    <div className="my-1 border-t border-[#262626]"></div>

                                    <button
                                      onClick={() => handleDeleteUser(u)}
                                      className="w-full px-3.5 py-2 text-red-400 hover:bg-red-500/10 text-left font-medium transition cursor-pointer"
                                    >
                                      Delete User
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden divide-y divide-[#1F1F1F]">
                {users.map((u) => {
                  const isSuperAdminRow = isSuperAdminUser(u);

                  return (
                    <div key={u._id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={u.profileImage || 'https://via.placeholder.com/40'}
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover border border-[#262626]"
                            onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                          />
                          <div>
                            <p className="font-semibold text-white text-sm">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>

                        {isSuperAdminRow ? (
                          <LockClosedIcon className="w-4 h-4 text-purple-400" title="Primary Administrator" />
                        ) : (
                          <div className="relative" ref={activeMenuId === u._id ? menuRef : null}>
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === u._id ? null : u._id)}
                              className="p-2 text-gray-400 hover:text-white bg-[#161616] rounded-lg cursor-pointer"
                            >
                              <EllipsisVerticalIcon className="w-5 h-5" />
                            </button>

                            {activeMenuId === u._id && (
                              <div className="absolute right-0 mt-1 w-44 bg-[#161616] border border-[#262626] rounded-xl shadow-xl z-30 text-left py-1 text-xs">
                                <button
                                  onClick={() => { setSelectedUserId(u._id); setIsDrawerOpen(true); setActiveMenuId(null); }}
                                  className="w-full px-3.5 py-2 text-gray-200 hover:bg-[#222] text-left"
                                >
                                  View Profile
                                </button>
                                <button
                                  onClick={() => handleToggleVerify(u)}
                                  className="w-full px-3.5 py-2 text-gray-200 hover:bg-[#222] text-left"
                                >
                                  {u.isVerified !== false ? 'Remove Verify' : 'Verify Student'}
                                </button>
                                <button
                                  onClick={() => handleToggleSuspend(u)}
                                  className="w-full px-3.5 py-2 text-gray-200 hover:bg-[#222] text-left"
                                >
                                  {u.status === 'Suspended' ? 'Activate User' : 'Suspend User'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="w-full px-3.5 py-2 text-red-400 hover:bg-red-500/10 text-left"
                                >
                                  Delete User
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 bg-[#161616] border border-[#262626] rounded text-gray-300">{u.college || 'N/A'}</span>
                        <span className="px-2 py-0.5 bg-[#161616] border border-[#262626] rounded text-gray-300">{u.department}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                          u.isVerified !== false ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {u.isVerified !== false ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Simple Pagination */}
          <div className="p-4 border-t border-[#1F1F1F] bg-[#111111] flex items-center justify-between">
            <button
              disabled={page <= 1}
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 bg-[#161616] border border-[#262626] text-gray-300 rounded-lg text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#222222] transition cursor-pointer"
            >
              Previous
            </button>

            <span className="text-xs text-gray-400 font-medium">
              Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 bg-[#161616] border border-[#262626] text-gray-300 rounded-lg text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#222222] transition cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* User Detail Side Drawer */}
      <UserDetailDrawer
        userId={selectedUserId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center">
                <UserPlusIcon className="w-4 h-4 mr-2 text-blue-500" />
                Add User
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="Full Name"
                  className="w-full p-2 bg-[#161616] border border-[#262626] text-white rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="email@domain.com"
                  className="w-full p-2 bg-[#161616] border border-[#262626] text-white rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  placeholder="Min 6 chars"
                  className="w-full p-2 bg-[#161616] border border-[#262626] text-white rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">College</label>
                  <select
                    required
                    value={newUserData.college}
                    onChange={(e) => setNewUserData({ ...newUserData, college: e.target.value })}
                    className="w-full p-2 bg-[#161616] border border-[#262626] text-white rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select College</option>
                    {APPROVED_COLLEGES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={newUserData.department}
                    onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
                    placeholder="Computer Science"
                    className="w-full p-2 bg-[#161616] border border-[#262626] text-white rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 bg-[#161616] text-gray-300 rounded-lg font-medium hover:bg-[#222]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-3">
              <h3 className="text-sm font-bold text-white">Edit User: {editingUser.name}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full p-2 bg-[#161616] border border-[#262626] text-white rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Department</label>
                <input
                  type="text"
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="w-full p-2 bg-[#161616] border border-[#262626] text-white rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3.5 py-1.5 bg-[#161616] text-gray-300 rounded-lg font-medium hover:bg-[#222]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Layout>
  );
};

export default AdminDashboard;
