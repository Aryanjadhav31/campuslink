const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

// ✅ Import routes
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
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ✅ CORS Middleware - MUST be before routes
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));

const path = require('path');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ ROUTES - MUST be registered
app.use('/api/auth', authRoutes);        // ✅ THIS IS REQUIRED
app.use('/api/users', userRoutes);
app.use('/api/students', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// ✅ Test route to verify server is running
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

const socketHandler = require('./sockets/socketHandler');

// ✅ Socket.IO
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('⚡ Client connected to Socket.io:', socket.id);
  socketHandler(socket, io);
});

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Role Sanitization Migration
    try {
      const User = require('./models/User');
      const adminEmail = (process.env.ADMIN_EMAIL || 'aryanjyoti.31@gmail.com').toLowerCase();
      
      // Demote all users with admin role whose email is NOT adminEmail
      const demotedResult = await User.updateMany(
        { email: { $ne: adminEmail }, role: 'admin' },
        { $set: { role: 'student' } }
      );
      if (demotedResult.modifiedCount > 0) {
        console.log(`🛡️ Demoted ${demotedResult.modifiedCount} unauthorized admin accounts to student role.`);
      }

      // Ensure designated admin user exists and has admin role
      const adminUser = await User.findOne({ email: adminEmail });
      if (adminUser && adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        adminUser.isVerified = true;
        await adminUser.save();
        console.log(`👑 Enforced Admin role for designated email: ${adminEmail}`);
      }
    } catch (migErr) {
      console.error('⚠️ Role migration notice:', migErr.message);
    }

    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
      console.log(`📡 Test: http://localhost:${process.env.PORT || 5000}/api/test`);
    });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));