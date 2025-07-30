const express = require('express');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const User = require('./models/User');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);

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
sequelize.sync()
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