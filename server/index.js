const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
console.log(process.env.JWT_SECRET);

const authRoutes     = require('./routes/auth');
const contactRoutes  = require('./routes/contacts');
const locationRoutes = require('./routes/location');
const sosRoutes      = require('./routes/sos');
const noteRoutes     = require('./routes/notes');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET','POST'] }
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',     authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/sos',      sosRoutes);
app.use('/api/notes',    noteRoutes);

app.get('/', (_req, res) => res.json({ message: 'BRAHMASTRA' }));

/* ── Socket.io real-time ── */
const activeUsers = {};
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    activeUsers[userId] = socket.id;
    socket.userId = userId;
  });

  socket.on('location:update', ({ userId, latitude, longitude, sharedWith }) => {
    sharedWith.forEach((cid) => {
      if (activeUsers[cid]) io.to(activeUsers[cid]).emit('location:received', { userId, latitude, longitude, timestamp: new Date() });
    });
  });

  socket.on('sos:trigger', ({ userId, userName, latitude, longitude, contacts }) => {
    contacts.forEach((cid) => {
      if (activeUsers[cid]) io.to(activeUsers[cid]).emit('sos:alert', {
        userId, userName, latitude, longitude, timestamp: new Date(),
        message: `🚨 SOS! ${userName} needs help! Lat:${latitude} Lng:${longitude}`
      });
    });
  });

  socket.on('disconnect', () => { if (socket.userId) delete activeUsers[socket.userId]; });
});

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/BRAHMASTRA')
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(process.env.PORT || 5000, () => console.log(`🚀 Server on port ${process.env.PORT || 5000}`));
  })
  .catch((err) => console.error('❌ MongoDB error:', err));