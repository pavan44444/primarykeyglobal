const express = require('express');
const sequelize = require('./config/database');
const path = require('path');
const fs = require('fs');

// Import your models and routes
const User = require('./models/User');
const college = require('./models/College'); // <-- Corrected: Use uppercase for the model class
const authRoutes = require('./routes/auth');
const collegeRoutes = require('./routes/collegeRoutes'); // <-- Corrected: Use plural name to match convention

const app = express();

// --- CRITICAL FIX: Place body-parsing middleware at the top ---
// Middleware to parse incoming request bodies (JSON and URL-encoded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// --- Route mounting after middleware ---
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes); // <-- Corrected: Mount the college routes just once

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Database sync and server start
// IMPORTANT: Use { alter: true } for development
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ DB synced');
    app.listen(3000, () => {
      console.log('🚀 Server at http://localhost:3000');
    });
  })
  .catch(err => {
    console.error('❌ DB sync failed', err);
    process.exit(1);
  });