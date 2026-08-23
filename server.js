const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const companyRoutes = require('./routes/companyRoutes');
const tutorialRoutes = require('./routes/tutorialRoutes');
const topicRoutes = require('./routes/topicRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const profileRoutes = require('./routes/profileRoutes');
const quizRoutes = require('./routes/quizRoutes');
const articleRoutes = require('./routes/articleRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/tutorials', tutorialRoutes);
app.use('/api/topics',topicRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api', profileRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/articles', articleRoutes);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Open registration page on root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'auth', 'registration.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
