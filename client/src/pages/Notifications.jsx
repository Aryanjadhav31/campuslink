import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { notifications as notificationsApi, friends as friendsApi } from '../services/api';
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
  CheckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const Notifications = () => {
  const { user, updateUser } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [handledRequests, setHandledRequests] = useState({});

  useEffect(() => {
    fetchNotifications();
    
    // Listen for new notifications via socket
    if (socket) {
      const handleNewNotification = (notification) => {
        console.log('🔔 New notification received via socket:', notification);
        setNotifications(prev => {
          const current = Array.isArray(prev) ? prev : [];
          // Avoid duplicate notifications in state
          if (current.some(n => n._id === notification._id)) return current;
          return [notification, ...current];
        });
        toast.info(notification.message || 'New notification received!');
      };

      socket.on('notification', handleNewNotification);
      socket.on('new_notification', handleNewNotification);
      socket.on('friend_request', handleNewNotification);

      return () => {
        socket.off('notification', handleNewNotification);
        socket.off('new_notification', handleNewNotification);
        socket.off('friend_request', handleNewNotification);
      };
    }
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📥 Fetching notifications...');
      const { data } = await notificationsApi.getAll();
      
      console.log('📋 Notifications response:', data);
      
      if (Array.isArray(data)) {
        setNotifications(data);
      } else if (data && typeof data === 'object' && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      } else {
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
      await notificationsApi.markAsRead(id);
      setNotifications(prev => {
        const current = Array.isArray(prev) ? prev : [];
        return current.map(notif =>
          notif._id === id ? { ...notif, read: true } : notif
        );
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
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
      await notificationsApi.delete(id);
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

  const handleAcceptFriendRequest = async (notification) => {
    const senderId = notification.from?._id || notification.from;
    setActionLoading(prev => ({ ...prev, [notification._id]: true }));
    try {
      await friendsApi.acceptRequest(senderId);
      toast.success(`Accepted friend request from ${notification.from?.name || 'student'}! 🎉`);
      
      setHandledRequests(prev => ({ ...prev, [notification._id]: 'accepted' }));
      markAsRead(notification._id);

      if (updateUser && senderId) {
        const currentFriends = user?.friends || [];
        if (!currentFriends.includes(senderId)) {
          updateUser({ friends: [...currentFriends, senderId] });
        }
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error(error.response?.data?.message || 'Failed to accept friend request');
    } finally {
      setActionLoading(prev => ({ ...prev, [notification._id]: false }));
    }
  };

  const handleRejectFriendRequest = async (notification) => {
    const senderId = notification.from?._id || notification.from;
    setActionLoading(prev => ({ ...prev, [notification._id]: true }));
    try {
      await friendsApi.rejectRequest(senderId);
      toast.success('Friend request rejected');
      
      setHandledRequests(prev => ({ ...prev, [notification._id]: 'rejected' }));
      markAsRead(notification._id);
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error(error.response?.data?.message || 'Failed to reject friend request');
    } finally {
      setActionLoading(prev => ({ ...prev, [notification._id]: false }));
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'friend_request':
        return <UserPlusIcon className="w-6 h-6 text-blue-500" />;
      case 'friend_accept':
        return <CheckCircleIcon className="w-6 h-6 text-emerald-500" />;
      case 'friend_reject':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      case 'message':
        return <ChatBubbleLeftIcon className="w-6 h-6 text-purple-500" />;
      case 'like':
        return <HeartIcon className="w-6 h-6 text-red-500" />;
      case 'comment':
        return <ChatBubbleLeftIcon className="w-6 h-6 text-amber-500" />;
      case 'event_reminder':
        return <CalendarIcon className="w-6 h-6 text-orange-500" />;
      case 'community_invite':
        return <UserGroupIcon className="w-6 h-6 text-emerald-500" />;
      default:
        return <BellIcon className="w-6 h-6 text-gray-500" />;
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

  const notificationsArray = Array.isArray(notifications) ? notifications : [];
  const unreadCount = notificationsArray.filter(n => !n.read).length;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 dark:text-zinc-400">Loading notifications...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6 text-center border border-red-200 bg-red-50 dark:bg-red-900/10 rounded-xl">
          <div className="mb-4 text-4xl">⚠️</div>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={fetchNotifications}
            className="px-4 py-2 mt-4 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
        <div className="overflow-hidden bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1F1F1F] text-gray-900 dark:text-white shadow-sm rounded-2xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-[#1F1F1F]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
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
              <div className="flex items-center justify-center w-20 h-20 mb-4 bg-gray-100 dark:bg-[#161616] rounded-full">
                <BellIcon className="w-10 h-10 text-gray-400 dark:text-zinc-500" />
              </div>
              <p className="text-lg font-medium text-gray-500 dark:text-zinc-400">No notifications yet</p>
              <p className="mt-1 text-sm text-gray-400 dark:text-zinc-500">
                You'll see notifications when someone interacts with you
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-[#1F1F1F]">
              {notificationsArray.map((notification) => {
                if (!notification || typeof notification !== 'object') return null;
                
                const isUnread = !notification.read;
                const isFriendReq = notification.type === 'friend_request';
                const handledState = handledRequests[notification._id];
                const isProcessing = actionLoading[notification._id];

                return (
                  <div
                    key={notification._id || Math.random()}
                    className={`p-5 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-all duration-200 ${
                      isUnread ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icon/Avatar */}
                      <div className="flex-shrink-0 mt-1">
                        {notification.from?.profileImage ? (
                          <img
                            src={notification.from.profileImage}
                            alt={notification.from.name}
                            className="object-cover w-11 h-11 border-2 border-gray-200 dark:border-[#262626] rounded-full shadow-sm"
                            onError={(e) => e.target.src = 'https://via.placeholder.com/44'}
                          />
                        ) : (
                          <div className="flex items-center justify-center w-11 h-11 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#262626] rounded-full">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium leading-relaxed text-gray-900 dark:text-zinc-100">
                              {notification.message || 'New notification'}
                            </p>
                            
                            <div className="flex items-center mt-1.5 space-x-3">
                              <span className="text-xs text-gray-400 dark:text-zinc-500">
                                {formatDate(notification.createdAt)}
                              </span>
                              {isUnread && (
                                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full" title="Unread"></span>
                              )}
                            </div>

                            {/* Friend Request Accept / Reject Actions */}
                            {isFriendReq && (
                              <div className="mt-3">
                                {handledState === 'accepted' ? (
                                  <span className="inline-flex items-center px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-500/20">
                                    <CheckCircleIcon className="w-4 h-4 mr-1 text-emerald-500" /> Request Accepted
                                  </span>
                                ) : handledState === 'rejected' ? (
                                  <span className="inline-flex items-center px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg border border-red-500/20">
                                    <XCircleIcon className="w-4 h-4 mr-1 text-red-500" /> Request Declined
                                  </span>
                                ) : (
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleAcceptFriendRequest(notification)}
                                      disabled={isProcessing}
                                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center cursor-pointer disabled:opacity-50"
                                    >
                                      {isProcessing ? (
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                                      ) : (
                                        <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                                      )}
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => handleRejectFriendRequest(notification)}
                                      disabled={isProcessing}
                                      className="px-4 py-2 bg-gray-100 dark:bg-[#222] hover:bg-gray-200 dark:hover:bg-[#333] text-gray-700 dark:text-zinc-300 text-xs font-semibold rounded-xl transition-all border border-gray-200 dark:border-[#333] flex items-center cursor-pointer disabled:opacity-50"
                                    >
                                      <XCircleIcon className="w-4 h-4 mr-1.5 text-gray-400" />
                                      Decline
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>

                          <div className="flex items-center ml-4 space-x-1">
                            {isUnread && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors cursor-pointer"
                                title="Mark as read"
                              >
                                <CheckIcon className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification._id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors cursor-pointer"
                              title="Delete notification"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {notification.link && !isFriendReq && (
                          <Link
                            to={notification.link}
                            className="inline-block mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
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