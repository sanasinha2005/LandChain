require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Database initialization
require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const landRoutes = require('./routes/landRoutes');
const transferRoutes = require('./routes/transferRoutes');
const registrarRoutes = require('./routes/registrarRoutes');
const statsRoutes = require('./routes/statsRoutes');
const activityRoutes = require('./routes/activityRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/land', landRoutes);
app.use('/api/transfer', transferRoutes);
app.use('/api/registrar', registrarRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/activity', activityRoutes);

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'LandChain Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Centralized error handler
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🏛️  LANDCHAIN BACKEND SERVER RUNNING ON PORT ${PORT}`);
    console.log(`🔗  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📜  Hyperledger Fabric Gateway: Connected`);
    console.log(`=======================================================`);
  });
}

module.exports = app;

