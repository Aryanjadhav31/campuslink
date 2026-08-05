import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { notifications as notificationsApi } from '../services/api';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadNotifications = async () => {
    try {
      const { data } = await notificationsApi.getAll();
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error('Error fetching unread notifications:', err);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchUnreadNotifications();

      const newSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        withCredentials: true
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('🔌 Socket connected');
        newSocket.emit('join', user._id);
        newSocket.emit('set-user', user._id);
      });

      newSocket.on('user-online', (userId) => {
        setOnlineUsers(prev => [...new Set([...prev, userId])]);
      });

      newSocket.on('user-offline', (userId) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId));
      });

      const handleNotification = (notification) => {
        console.log('🔔 Socket Notification received:', notification);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      };

      newSocket.on('notification', handleNotification);
      newSocket.on('new_notification', handleNotification);
      newSocket.on('friend_request', handleNotification);
      newSocket.on('request_accepted', handleNotification);
      newSocket.on('request_rejected', handleNotification);

      newSocket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
      });

      return () => {
        newSocket.close();
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, token]);

  const value = { 
    socket, 
    onlineUsers, 
    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount,
    fetchUnreadNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};