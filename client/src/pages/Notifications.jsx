import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { 
  BellIcon,
  UserPlusIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const Notifications = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
    
    // Listen for new notifications via socket
    if (socket) {
      socket.on('notification', (notification) => {
        console.log('🔔 New notification received:', notification);
        setNotifications(prev => {
          // Ensure prev is an array before spreading
          const current = Array.isArray(prev) ? prev : [];
          return [notification, ...current];
        });
        toast.info(notification.message || 'New notification');
      });
    }
    
    return () => {
      if (socket) {
        socket.off('notification');
      }
    };
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📥 Fetching notifications...');
      const { data } = await axios.get('http://localhost:5000/api/notifications');
      
      console.log('📋 Notifications response:', data);
      
      // ✅ CRITICAL FIX: Ensure data is an array
      if (Array.isArray(data)) {
        setNotifications(data);
      } else if (data && typeof data === 'object') {
        // If API returns an object with a notifications array
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        } else {
          // If API returns an object with other structure, try to extract
          const possibleArray = Object.values(data).find(val => Array.isArray(val));
          if (possibleArray) {
            setNotifications(possibleArray);
          } else {
            console.warn('⚠️ Unexpected data format:', data);
            setNotifications([]);
          }
        }
      } else {
        console.warn('⚠️ Data is not an array:', data);
        setNotifications([]);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      setError('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
      setNotifications(prev => {
        // Ensure prev is an array before mapping
        const current = Array.isArray(prev) ? prev : [];
        return current.map(notif =>
          notif._id === id ? { ...notif, read: true } : notif
        );
      });
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/read-all');
      setNotifications(prev => {
        const current = Array.isArray(prev) ? prev : [];
        return current.map(notif => ({ ...notif, read: true }));
      });
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`);
      setNotifications(prev => {
        const current = Array.isArray(prev) ? prev : [];
        return current.filter(notif => notif._id !== id);
      });
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'friend_request':
        return <UserPlusIcon className="w-6 h-6 text-blue-500" />;
      case 'friend_accept':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'message':
        return <ChatBubbleLeftIcon className="w-6 h-6 text-purple-500" />;
      case 'like':
        return <HeartIcon className="w-6 h-6 text-red-500" />;
      case 'comment':
        return <ChatBubbleLeftIcon className="w-6 h-6 text-yellow-500" />;
      case 'event_reminder':
        return <CalendarIcon className="w-6 h-6 text-orange-500" />;
      case 'community_invite':
        return <UserGroupIcon className="w-6 h-6 text-green-500" />;
      default:
        return <BellIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'friend_request':
        return 'bg-blue-50 border-blue-200';
      case 'friend_accept':
        return 'bg-green-50 border-green-200';
      case 'message':
        return 'bg-purple-50 border-purple-200';
      case 'like':
        return 'bg-red-50 border-red-200';
      case 'comment':
        return 'bg-yellow-50 border-yellow-200';
      case 'event_reminder':
        return 'bg-orange-50 border-orange-200';
      case 'community_invite':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Just now';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // ✅ Ensure notifications is always an array
  const notificationsArray = Array.isArray(notifications) ? notifications : [];
  const unreadCount = notificationsArray.filter(n => !n.read).length;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6 text-center border border-red-200 bg-red-50 rounded-xl">
          <div className="mb-4 text-4xl">⚠️</div>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchNotifications}
            className="px-4 py-2 mt-4 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="overflow-hidden bg-white shadow-sm rounded-xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                  <CheckIcon className="w-4 h-4 mr-1" />
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          {notificationsArray.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex items-center justify-center w-20 h-20 mb-4 bg-gray-100 rounded-full">
                <BellIcon className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-500">No notifications yet</p>
              <p className="mt-1 text-sm text-gray-400">
                You'll see notifications when someone interacts with you
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notificationsArray.map((notification) => {
                // Skip invalid notifications
                if (!notification || typeof notification !== 'object') return null;
                
                const isUnread = !notification.read;
                const colorClass = getNotificationColor(notification.type);
                
                return (
                  <div
                    key={notification._id || Math.random()}
                    className={`p-4 hover:bg-gray-50 transition-all duration-200 ${
                      isUnread ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icon/Avatar */}
                      <div className="flex-shrink-0 mt-1">
                        {notification.from ? (
                          <img
                            src={notification.from.profileImage || 'https://via.placeholder.com/40'}
                            alt={notification.from.name}
                            className="object-cover w-10 h-10 border-2 border-gray-100 rounded-full"
                            onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                          />
                        ) : (
                          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm leading-relaxed text-gray-800">
                              {notification.message || 'New notification'}
                            </p>
                            <div className="flex items-center mt-1 space-x-3">
                              <span className="text-xs text-gray-400">
                                {formatDate(notification.createdAt)}
                              </span>
                              {isUnread && (
                                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center ml-4 space-x-1">
                            {isUnread && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="p-1 text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                                title="Mark as read"
                              >
                                <CheckIcon className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification._id)}
                              className="p-1 text-gray-400 transition-colors rounded-full hover:text-red-600 hover:bg-red-50"
                              title="Delete notification"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {notification.link && (
                          <Link
                            to={notification.link}
                            className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                            onClick={() => markAsRead(notification._id)}
                          >
                            View Details →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;