import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  PaperAirplaneIcon, 
  PhotoIcon, 
  ArrowLeftIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';

const Chat = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [receiver, setReceiver] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch receiver info and messages
  useEffect(() => {
    if (userId) {
      fetchChatData();
    }
  }, [userId]);

  const fetchChatData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📥 Fetching chat data for:', userId);
      
      const [userRes, messagesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/users/${userId}`),
        axios.get(`http://localhost:5000/api/chat/messages/${userId}`)
      ]);
      
      console.log('👤 Receiver:', userRes.data);
      console.log('💬 Messages:', messagesRes.data);
      
      setReceiver(userRes.data);
      setMessages(Array.isArray(messagesRes.data) ? messagesRes.data : []);
      
      // Mark messages as read
      await axios.put(`http://localhost:5000/api/chat/read/${userId}`);
      
    } catch (error) {
      console.error('❌ Error fetching chat data:', error);
      setError('Failed to load conversation');
      toast.error('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  // Socket events
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on('new-message', (message) => {
      if (message.sender._id === userId || message.receiver._id === userId) {
        setMessages(prev => {
          const current = Array.isArray(prev) ? prev : [];
          return [...current, message];
        });
        // Mark as read if it's from the other user
        if (message.sender._id === userId) {
          socket.emit('mark-read', { messageId: message._id });
        }
      }
    });

    // Listen for message read status
    socket.on('message-read', (messageId) => {
      setMessages(prev => {
        const current = Array.isArray(prev) ? prev : [];
        return current.map(msg => 
          msg._id === messageId ? { ...msg, isRead: true } : msg
        );
      });
    });

    // Listen for typing indicator
    socket.on('user-typing', (data) => {
      if (data.userId === userId) {
        setTypingUser(data.isTyping);
      }
    });

    return () => {
      socket.off('new-message');
      socket.off('message-read');
      socket.off('user-typing');
    };
  }, [socket, userId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !fileInputRef.current?.files[0]) return;

    setSending(true);
    let imageUrl = null;

    try {
      // Upload image if exists
      if (fileInputRef.current?.files[0]) {
        const formData = new FormData();
        formData.append('image', fileInputRef.current.files[0]);
        const { data } = await axios.post('http://localhost:5000/api/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = data.url;
      }

      // Send message
      const messageData = {
        receiverId: userId,
        message: newMessage.trim(),
        image: imageUrl
      };

      const { data } = await axios.post('http://localhost:5000/api/chat/send', messageData);
      
      // Emit via socket
      socket.emit('send-message', {
        receiverId: userId,
        message: newMessage.trim(),
        image: imageUrl
      });

      // Add to local messages
      setMessages(prev => {
        const current = Array.isArray(prev) ? prev : [];
        return [...current, data];
      });
      setNewMessage('');
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Stop typing
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        socket.emit('typing', { receiverId: userId, isTyping: false });
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!socket) return;
    
    // Emit typing event
    if (e.target.value.length > 0) {
      socket.emit('typing', { receiverId: userId, isTyping: true });
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { receiverId: userId, isTyping: false });
      }, 3000);
    } else {
      socket.emit('typing', { receiverId: userId, isTyping: false });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const isOnline = onlineUsers && Array.isArray(onlineUsers) && onlineUsers.includes(userId);

  const messagesArray = Array.isArray(messages) ? messages : [];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading conversation...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6 text-center border border-red-200 bg-red-50 rounded-xl">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchChatData}
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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[80vh] flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center p-4 space-x-4 bg-white border-b border-gray-200">
            <button
              onClick={() => navigate('/messages')}
              className="p-2 transition-colors rounded-lg hover:bg-gray-100"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            
            <div className="relative flex-shrink-0">
              <img
                src={receiver?.profileImage || 'https://via.placeholder.com/40'}
                alt={receiver?.name || 'User'}
                className="object-cover w-10 h-10 border-2 border-gray-100 rounded-full"
                onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
              />
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{receiver?.name || 'Unknown User'}</h3>
              <p className="text-sm text-gray-500">
                {isOnline ? 'Online' : 'Offline'}
                {typingUser && ' • Typing...'}
              </p>
            </div>
            
            <button className="p-2 transition-colors rounded-lg hover:bg-gray-100">
              <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
            {messagesArray.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="flex items-center justify-center w-20 h-20 mb-4 bg-gray-200 rounded-full">
                  <ChatBubbleLeftIcon className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-500">No messages yet</p>
                <p className="mt-1 text-sm text-gray-400">
                  Start a conversation with {receiver?.name || 'this user'}
                </p>
              </div>
            ) : (
              messagesArray.map((message, index) => {
                const isOwn = message.sender?._id === user?._id;
                const showDate = index === 0 || 
                  new Date(message.createdAt).toDateString() !== 
                  new Date(messagesArray[index - 1]?.createdAt).toDateString();

                return (
                  <React.Fragment key={message._id || index}>
                    {showDate && (
                      <div className="flex justify-center">
                        <span className="px-3 py-1 text-xs text-gray-500 bg-gray-200 rounded-full">
                          {new Date(message.createdAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                        {!isOwn && (
                          <p className="mb-1 ml-1 text-xs text-gray-500">
                            {message.sender?.name || 'User'}
                          </p>
                        )}
                        
                        <div className={`rounded-2xl px-4 py-2.5 ${
                          isOwn 
                            ? 'bg-blue-600 text-white rounded-br-sm' 
                            : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                        }`}>
                          {message.image && (
                            <img
                              src={message.image}
                              alt="Message"
                              className="object-cover max-w-full mb-2 rounded-lg max-h-64"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          )}
                          {message.message && <p className="break-words whitespace-pre-wrap">{message.message}</p>}
                        </div>
                        
                        <div className={`flex items-center space-x-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-xs text-gray-400">
                            {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : ''}
                          </span>
                          {isOwn && (
                            <span className="text-xs text-gray-400">
                              {message.isRead ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
              <div className="relative flex-1">
                <textarea
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[44px] max-h-32 transition"
                  rows="1"
                  disabled={sending}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute right-2 bottom-2.5 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <PhotoIcon className="w-5 h-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <button
                type="submit"
                disabled={sending || (!newMessage.trim() && !fileInputRef.current?.files[0])}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;