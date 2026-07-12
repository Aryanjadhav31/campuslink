const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Import routes - MAKE SURE THESE EXIST
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const friendRoutes = require('./routes/friendRoutes');
const chatRoutes = require('./routes/chatRoutes');
const postRoutes = require('./routes/postRoutes');
const communityRoutes = require('./routes/communityRoutes');
const eventRoutes = require('./routes/eventRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/dashboard', dashboardRoutes);

// ===== IMPORTANT: ROUTES =====
// These MUST be registered before the server starts
app.use('/api/auth', authRoutes);        // For registration/login
app.use('/api/users', userRoutes);        // For user profiles
app.use('/api/friends', friendRoutes);    // For friend requests
app.use('/api/chat', chatRoutes);         // For messaging
app.use('/api/posts', postRoutes);        // For posts
app.use('/api/communities', communityRoutes); // For communities
app.use('/api/events', eventRoutes);      // For events
app.use('/api/notifications', notificationRoutes); // For notifications
app.use('/api/upload', uploadRoutes);     // For file uploads

// Test route to verify API is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
      console.log(`📡 API available at http://localhost:${process.env.PORT || 5000}/api`);
    });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));