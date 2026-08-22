const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const playerRoutes = require('./routes/playerRoutes');
const bidderRoutes = require('./routes/bidderRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Socket handler
// Socket handler
const setupAuctionSocket = require('./sockets/auctionSocket');

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/bidders', bidderRoutes);
app.use('/api/auction', auctionRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();

  // Setup Socket.IO
  setupAuctionSocket(io);

  server.listen(config.port, () => {
    console.log(`\n🚀 Server running on port ${config.port}`);
    console.log(`📡 Socket.IO ready`);
    console.log(`🌐 CORS origin: ${config.clientUrl}`);
    console.log(`📦 Environment: ${config.nodeEnv}\n`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
