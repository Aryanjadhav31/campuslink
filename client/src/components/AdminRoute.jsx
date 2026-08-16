import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import toast from 'react-hot-toast';

const AdminRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && user.role !== 'admin') {
      toast.error("You don't have permission to access the admin panel.");
    }
  }, [loading, user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 mx-auto border-2 border-zinc-400 dark:border-zinc-700 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
