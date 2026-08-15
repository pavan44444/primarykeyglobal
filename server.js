const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const userRoutes = require('./routes/userRoutes');

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use('/api', userRoutes);

// Routes
const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const companyRoutes = require('./routes/companyRoutes');
const quizRoutes = require('./routes/quizRoutes');
const collegeRoutes = require("./routes/collegeRoutes");
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const preparationRoutes = require('./routes/preparationRoutes');
const announcementRoutes = require('./routes/announcementRoutes'); // ADD THIS LINE
const profileRoutes = require('./routes/profileRoutes');
app.use('/api/preparation-kits', preparationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/announcements', announcementRoutes); // ADD THIS LINE
app.use(express.static(path.join(__dirname, 'public')));
app.use("/api/leaderboard", leaderboardRoutes);

app.use('/api', profileRoutes);
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'auth', 'registration.html'));
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
