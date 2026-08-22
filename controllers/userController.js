const db = require('../config/db');

// Fetch all users of the logged-in user's college with quiz stats
exports.getUsersByCollegeWithQuizStats = async (req, res) => {
    try {
        const user_id = req.user.id; // from JWT

        // Step 1: Get logged-in user's college_id
        const [userData] = await db.query(
            'SELECT college_id FROM users WHERE user_id = ?',
            [user_id]
        );

        if (userData.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const college_id = userData[0].college_id;

        // Step 2: Fetch users + quiz stats
        const [users] = await db.query(
            `SELECT u.user_id, u.name, u.email, u.city, u.role, u.created_at,
                    COUNT(DISTINCT qr.quiz_id) AS quizzes_attended,
                    COALESCE(SUM(qr.points_scored), 0) AS total_points
             FROM users u
             LEFT JOIN quiz_results qr ON u.user_id = qr.user_id
             WHERE u.college_id = ?
             GROUP BY u.user_id, u.name, u.email, u.city, u.role, u.created_at
             ORDER BY total_points DESC`,
            [college_id]
        );

        res.json(users);

    } catch (err) {
        console.error('Error fetching users with quiz stats:', err);
        res.status(500).json({ message: 'Server error' });
    }
};


