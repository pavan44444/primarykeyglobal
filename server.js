const express = require('express');
const sequelize = require('./config/database');
const path = require('path');
const fs = require('fs');

// --- Import Models ---
// It's good practice to import all models here so Sequelize is aware of them.
const User = require('./models/User');
const College = require('./models/College');
const InterviewExperience = require('./models/InterviewExperience');
//const Quiz = require('./models/Quiz'); // New: Quiz model
//const Question = require('./models/Question'); // New: Question model
const Company = require('./models/Company'); // New: Company model

// --- Import Routes ---
// Group all your route files together for clarity.
const authRoutes = require('./routes/auth');
const collegeRoutes = require('./routes/collegeRoutes');
const interviewExperienceRoutes = require('./routes/interviewExperienceRoutes');
const companyRoutes = require('./routes/companyRoutes');
//const quizRoutes = require('./routes/quizRoutes');

const app = express();

// --- Middleware ---
// CRITICAL: Body-parsing middleware must come first.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// --- Route Mounting ---
// Group all your route endpoints together.
app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/experiences', interviewExperienceRoutes);
app.use('/api/companies', companyRoutes);
//app.use('/api/quizzes', quizRoutes);

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
