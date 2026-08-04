import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import Communities from './pages/Communities';
import CommunityDetails from './pages/CommunityDetails';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import CreatePost from './pages/CreatePost';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <SocketProvider>
              <Toaster
                position="top-right"
                gutter={12}
                containerStyle={{
                  top: 80,
                  right: 24,
                  zIndex: 9999
                }}
              />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/signup" element={<Register />} />

                {/* Protected Routes */}
                <Route element={<PrivateRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/edit" element={<Navigate to="/settings?tab=profile" replace />} />
                  <Route path="/edit-profile" element={<Navigate to="/settings?tab=profile" replace />} />
                  <Route path="/students" element={<Students />} />
                  <Route path="/students/:id" element={<StudentProfile />} />
                  <Route path="/communities" element={<Communities />} />
                  <Route path="/communities/:id" element={<CommunityDetails />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:id" element={<EventDetails />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/create-post" element={<CreatePost />} />
                </Route>

                {/* Admin Protected Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </SocketProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;