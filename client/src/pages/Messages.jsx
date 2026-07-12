import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { ChatBubbleLeftIcon, MagnifyingGlassIcon, UserPlusIcon } from '@heroicons/react/24/outline';

const Messages = () => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const [chatUsers, setChatUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastMessages, setLastMessages] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChatUsers();
  }, []);

  const fetchChatUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📥 Fetching chat users...');
      const { data } = await axios.get('http://localhost:5000/api/chat/users');
      
      console.log('📋 Chat users response:', data);
      
      // ✅ CRITICAL FIX: Ensure data is an array
      let usersArray = [];
      if (Array.isArray(data)) {
        usersArray = data;
      } else if (data && typeof data === 'object') {
        // If API returns an object with users array
        if (Array.isArray(data.users)) {
          usersArray = data.users;
        } else {
          // Try to extract any array from the object
          const possibleArray = Object.values(data).find(val => Array.isArray(val));
          if (possibleArray) {
            usersArray = possibleArray;
          } else {
            console.warn('⚠️ Unexpected data format:', data);
            usersArray = [];
          }
        }
      } else {
        console.warn('⚠️ Data is not an array:', data);
        usersArray = [];
      }
      
      setChatUsers(usersArray);
      
      // Fetch last message for each chat user
      if (usersArray.length > 0) {
        await fetchLastMessages(usersArray);
      }
      
    } catch (error) {
      console.error('❌ Error fetching chat users:', error);
      setError('Failed to load conversations');
      setChatUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLastMessages = async (users) => {
    try {
      const lastMsgMap = {};
      
      // Fetch messages for each user in parallel
      const promises = users.map(async (chatUser) => {
        try {
          const { data: messages } = await axios.get(`http://localhost:5000/api/chat/messages/${chatUser._id}`);
          const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1] : null;
          return { userId: chatUser._id, lastMessage };
        } catch (error) {
          console.error(`Error fetching messages for ${chatUser._id}:`, error);
          return { userId: chatUser._id, lastMessage: null };
        }
      });
      
      const results = await Promise.all(promises);
      results.forEach(({ userId, lastMessage }) => {
        lastMsgMap[userId] = lastMessage;
      });
      
      setLastMessages(lastMsgMap);
    } catch (error) {
      console.error('❌ Error fetching last messages:', error);
    }
  };

  // ✅ Ensure chatUsers is always an array
  const chatUsersArray = Array.isArray(chatUsers) ? chatUsers : [];
  
  const filteredUsers = chatUsersArray.filter(chatUser =>
    chatUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
  );

  const getLastMessageTime = (userId) => {
    const msg = lastMessages[userId];
    if (!msg) return '';
    if (!msg.createdAt) return '';
    
    const date = new Date(msg.createdAt);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getLastMessagePreview = (userId) => {
    const msg = lastMessages[userId];
    if (!msg) return 'No messages yet';
    if (msg.message) return msg.message.length > 30 ? msg.message.substring(0, 30) + '...' : msg.message;
    if (msg.image) return '📷 Image';
    return 'No messages yet';
  };

  const isOnline = (userId) => {
    return onlineUsers && Array.isArray(onlineUsers) && onlineUsers.includes(userId);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading conversations...</p>
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
            onClick={fetchChatUsers}
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
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold">Messages</h2>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="w-full px-4 py-2 pl-10 transition border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Chat List */}
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex items-center justify-center w-20 h-20 mb-4 bg-gray-100 rounded-full">
                <ChatBubbleLeftIcon className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-500">No conversations yet</p>
              <p className="mt-1 text-sm text-gray-400">
                Connect with students to start chatting
              </p>
              <Link
                to="/students"
                className="px-6 py-2 mt-4 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Find Students
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredUsers.map((chatUser) => {
                // Skip invalid users
                if (!chatUser || !chatUser._id) return null;
                
                const online = isOnline(chatUser._id);
                const lastMsg = lastMessages[chatUser._id];
                const isUnread = lastMsg && !lastMsg.isRead && lastMsg.receiver === user?._id;
                
                return (
                  <Link
                    key={chatUser._id}
                    to={`/chat/${chatUser._id}`}
                    className="block transition-colors duration-150 hover:bg-gray-50"
                  >
                    <div className="flex items-center p-4 space-x-4">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={chatUser.profileImage || 'https://via.placeholder.com/50'}
                          alt={chatUser.name || 'User'}
                          className="object-cover w-12 h-12 border-2 border-gray-100 rounded-full"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/50';
                          }}
                        />
                        {online && (
                          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-white"></span>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold truncate">
                            {chatUser.name || 'Unknown User'}
                          </p>
                          <span className="flex-shrink-0 ml-2 text-xs text-gray-400">
                            {getLastMessageTime(chatUser._id)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className={`text-sm truncate ${isUnread ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                            {getLastMessagePreview(chatUser._id)}
                          </p>
                          {isUnread && (
                            <span className="h-2.5 w-2.5 bg-blue-600 rounded-full flex-shrink-0 ml-2"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Messages;