import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  ShieldCheckIcon, 
  UserPlusIcon, 
  MagnifyingGlassIcon, 
  KeyIcon, 
  TrashIcon, 
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Audit Logs State
  const [showLogs, setShowLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null);

  // Forms
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    department: '',
    year: '1st Year',
    role: 'student'
  });

  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`http://localhost:5000/api/admin/users`, {
        params: { search, page, limit: 10 },
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotalUsers(data.totalUsers || 0);
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
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`http://localhost:5000/api/admin/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/admin/users`, newUserData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('New user account created successfully!');
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
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPasswordVal || resetPasswordVal.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/admin/users/${selectedUser._id}/password`,
        { newPassword: resetPasswordVal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Password reset successfully for ${selectedUser.name}!`);
      setShowResetModal(false);
      setResetPasswordVal('');
      setSelectedUser(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/users/${selectedUser._id}`, {
        data: { adminPassword: adminConfirmPassword },
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`User ${selectedUser.name} deleted successfully`);
      setShowDeleteModal(false);
      setAdminConfirmPassword('');
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (targetUser, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/admin/users/${targetUser._id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Updated ${targetUser.name}'s role to ${newRole}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] p-6 rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                  Manage user accounts, credentials, access roles, and system activity logs ({totalUsers} total users)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setShowLogs(!showLogs);
                if (!showLogs) fetchAuditLogs();
              }}
              className="flex items-center px-4 py-2.5 bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#262626] text-gray-700 dark:text-zinc-300 rounded-xl text-xs font-semibold border border-gray-200 dark:border-[#262626] transition-colors"
            >
              <ClockIcon className="w-4 h-4 mr-2" />
              {showLogs ? 'Hide Audit Logs' : 'Audit Logs'}
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <UserPlusIcon className="w-4 h-4 mr-2" />
              Add New User
            </button>
          </div>
        </div>

        {/* Audit Logs Section */}
        {showLogs && (
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center">
              <ClockIcon className="w-4 h-4 mr-2 text-blue-500" />
              Recent Admin Action Logs
            </h3>
            {logsLoading ? (
              <div className="py-6 text-center text-xs text-gray-400">Loading audit trail...</div>
            ) : auditLogs.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-zinc-500">No audit logs recorded yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {auditLogs.map((log) => (
                  <div key={log._id} className="p-3 bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#262626] rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-semibold">
                        {log.action}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        Admin <strong className="text-blue-500">{log.adminName}</strong> {log.details}
                      </span>
                    </div>
                    <span className="text-gray-400 dark:text-zinc-500 text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Bar & Filters */}
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] p-4 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Filter users by name, email, college, or department..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500 absolute left-3 top-3" />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 mx-auto border-2 border-zinc-400 dark:border-zinc-700 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <UserIcon className="w-10 h-10 mx-auto text-gray-400 dark:text-zinc-600" />
              <p className="text-sm font-bold text-gray-900 dark:text-white">No users matching search</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-[#1F1F1F] bg-gray-50 dark:bg-[#161616] text-gray-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">College / Dept</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Joined</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#1F1F1F]">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-[#161616]/60 transition-colors">
                      {/* User Avatar + Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={u.profileImage || 'https://via.placeholder.com/40'}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-[#262626]"
                            onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                          />
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{u.name}</p>
                            <p className="text-[11px] text-gray-500 dark:text-zinc-400">@{u.username || u.name.toLowerCase().replace(/\s+/g, '_')}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-gray-700 dark:text-zinc-300 font-medium">
                        {u.email}
                      </td>

                      {/* College & Dept */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        <p className="font-semibold text-gray-900 dark:text-white">{u.college || 'N/A'}</p>
                        <p className="text-gray-500 dark:text-zinc-400 text-[11px]">{u.department} ({u.year})</p>
                      </td>

                      {/* Role Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={u.role || 'student'}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer focus:outline-none transition ${
                            u.role === 'admin'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                              : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-zinc-300 border-gray-300 dark:border-[#262626]'
                          }`}
                        >
                          <option value="student" className="bg-white dark:bg-[#111111] text-gray-900 dark:text-white">Student</option>
                          <option value="admin" className="bg-white dark:bg-[#111111] text-gray-900 dark:text-white">Admin</option>
                        </select>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-gray-500 dark:text-zinc-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setShowResetModal(true);
                          }}
                          className="p-2 rounded-lg bg-gray-100 dark:bg-[#1A1A1A] hover:bg-blue-50 dark:hover:bg-blue-500/10 text-gray-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                          title="Reset Password"
                        >
                          <KeyIcon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setShowDeleteModal(true);
                          }}
                          disabled={currentUser?._id === u._id}
                          className={`p-2 rounded-lg transition ${
                            currentUser?._id === u._id
                              ? 'opacity-30 cursor-not-allowed bg-gray-100 text-gray-400'
                              : 'bg-gray-100 dark:bg-[#1A1A1A] hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400'
                          }`}
                          title={currentUser?._id === u._id ? 'Cannot delete self' : 'Delete Account'}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="p-4 border-t border-gray-200 dark:border-[#1F1F1F] bg-gray-50 dark:bg-[#161616] flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
              Showing page <strong className="text-gray-900 dark:text-white">{page}</strong> of <strong className="text-gray-900 dark:text-white">{totalPages}</strong>
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="p-2 rounded-lg bg-white dark:bg-[#111111] border border-gray-300 dark:border-[#262626] text-gray-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2 rounded-lg bg-white dark:bg-[#111111] border border-gray-300 dark:border-[#262626] text-gray-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#1F1F1F] pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <UserPlusIcon className="w-5 h-5 mr-2 text-blue-500" />
                Add New User Account
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full p-2.5 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="student@campus.edu"
                  className="w-full p-2.5 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-semibold mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  placeholder="Set initial password (min 6 chars)"
                  className="w-full p-2.5 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-semibold mb-1">College</label>
                  <input
                    type="text"
                    required
                    value={newUserData.college}
                    onChange={(e) => setNewUserData({ ...newUserData, college: e.target.value })}
                    placeholder="Engineering College"
                    className="w-full p-2.5 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={newUserData.department}
                    onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
                    placeholder="Computer Science"
                    className="w-full p-2.5 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-semibold mb-1">Year</label>
                  <select
                    value={newUserData.year}
                    onChange={(e) => setNewUserData({ ...newUserData, year: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-semibold mb-1">Account Role</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-zinc-300 rounded-xl hover:bg-gray-200 dark:hover:bg-[#262626]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Reset Password Modal */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#1F1F1F] pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <KeyIcon className="w-5 h-5 mr-2 text-blue-500" />
                Reset User Password
              </h3>
              <button onClick={() => setShowResetModal(false)} className="text-gray-400 hover:text-white">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Reset password for <strong className="text-gray-900 dark:text-white">{selectedUser.name}</strong> ({selectedUser.email}).
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-semibold mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={resetPasswordVal}
                  onChange={(e) => setResetPasswordVal(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full p-2.5 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-zinc-300 rounded-xl hover:bg-gray-200 dark:hover:bg-[#262626]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Resetting...' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-[#111111] border border-red-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-500 border-b border-gray-200 dark:border-[#1F1F1F] pb-3">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <ExclamationTriangleIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete User Account</h3>
                <p className="text-xs text-red-500">Irreversible Action</p>
              </div>
            </div>

            <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-gray-900 dark:text-white">{selectedUser.name}</strong> ({selectedUser.email})?
              All associated posts, comments, likes, and friendships will be deleted.
            </p>

            <form onSubmit={handleDeleteUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 dark:text-zinc-300 font-semibold mb-1">
                  Re-enter Your Admin Password (Optional Security Confirmation)
                </label>
                <input
                  type="password"
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                  placeholder="Enter your admin password"
                  className="w-full p-2.5 bg-gray-50 dark:bg-[#161616] border border-gray-300 dark:border-[#262626] text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-zinc-300 rounded-xl hover:bg-gray-200 dark:hover:bg-[#262626]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Deleting...' : 'Delete Account'}
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
