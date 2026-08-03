import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 mx-auto border-2 border-zinc-400 dark:border-zinc-700 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
            <ShieldExclamationIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">403 - Access Denied</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-md">
            You do not have administrator permissions to access this page. This activity has been logged.
          </p>
        </div>
      </Layout>
    );
  }

  return <Outlet />;
};

export default AdminRoute;
