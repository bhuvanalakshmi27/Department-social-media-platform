const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const templateRoutes = require('./routes/templateRoutes');
const { initScheduler } = require('./services/scheduler');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campuspulse';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected successfully to MongoDB database');
    // Start background scheduler once DB connects
    initScheduler();
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/templates', templateRoutes);

// Base route for connectivity checks
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start Express App
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
