const express = require('express');
const sequelize = require('./config/database');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // --- Import CORS package ---

// --- Import Models ---
const User = require('./models/User');
const College = require('./models/College');
const InterviewExperience = require('./models/InterviewExperience');
//const Quiz = require('./models/Quiz');
//const Question = require('./models/Question');
 const Company = require('./models/Company');
 

// --- Import Routes ---
const authRoutes = require('./routes/auth');
const collegeRoutes = require('./routes/collegeRoutes');
const interviewExperienceRoutes = require('./routes/interviewExperienceRoutes');
 const companyRoutes = require('./routes/companyRoutes');
 
const visitRoutes = require('./routes/visitRoutes'); 
//const quizRoutes = require('./routes/quizRoutes');

const app = express();

// --- Middleware ---
// CRITICAL: Body-parsing and CORS middleware must come first.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // --- Use CORS middleware here ---

// You can also configure CORS for specific origins if needed.
// For example, to allow requests only from http://localhost:5173:
/*
const corsOptions = {
  origin: 'http://localhost:5173', // Replace with your front-end URL
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));
*/

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// --- Route Mounting ---
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
sequelize.sync({ alter: false})
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