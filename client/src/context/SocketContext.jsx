import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user && token) {
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

      newSocket.on('notification', (notification) => {
        console.log('🔔 New notification:', notification);
        setNotifications(prev => [notification, ...prev]);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
      });

      return () => {
        newSocket.close();
      };
    }
  }, [user, token]);

  const value = { 
    socket, 
    onlineUsers, 
    notifications,
    setNotifications 
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};