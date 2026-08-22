const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');


dotenv.config();

const app = express();
const topicRoutes = require('./routes/topicRoutes');
const articleRoutes = require('./routes/articleRoutes');
const tutorialRoutes = require('./routes/tutorialRoutes');
// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const companyRoutes = require('./routes/companyRoutes');
const quizRoutes = require('./routes/quizRoutes');
//const leaderboardRoutes = require('./routes/leaderboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/quizzes', quizRoutes);
//app.use("/api/leaderboard", leaderboardRoutes);

// Homepage → registration.html
app.get('/', (req, res) => {
    res.send('API is running...');
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});