const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

// Configure multer for profile picture upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles/'); // Make sure this folder exists
    },
    filename: (req, file, cb) => {
        const uniqueName = `profile-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
}).single('profile_pic');

// Get user profile with stats
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const [users] = await db.query(
            'SELECT user_id, name, email, college, city, role, total_points, profile_pic, created_at FROM users WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = users[0];

        // ✅ No join needed — quiz_submissions already has everything
        const [quizStats] = await db.query(`
            SELECT 
                COUNT(submission_id) as quizzes_taken,
                COALESCE(SUM(points_earned), 0) as total_score,
                COALESCE(AVG(score), 0) as average_score
            FROM quiz_submissions
            WHERE user_id = ?
        `, [userId]);

        const stats = quizStats[0];

        res.json({
            success: true,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                college: user.college,
                city: user.city,
                role: user.role,
                total_points: user.total_points || 0,
                profile_pic: user.profile_pic || null,
                created_at: user.created_at,
                quizzes_taken: parseInt(stats.quizzes_taken) || 0,
                total_score: parseInt(stats.total_score) || 0,
                average_score: parseFloat(stats.average_score).toFixed(2) || '0.00'
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update user profile (email only, no name change)
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        // Check if email already exists for another user
        const [existingUsers] = await db.query(
            'SELECT user_id FROM users WHERE email = ? AND user_id != ?',
            [email, userId]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }

        // Update email
        await db.query(
            'UPDATE users SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
            [email, userId]
        );

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Upload profile picture
const uploadProfilePicture = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        try {
            const userId = req.user.id;
            const profilePicPath = `/uploads/profiles/${req.file.filename}`;

            // Update profile picture in database
            await db.query(
                'UPDATE users SET profile_pic = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
                [profilePicPath, userId]
            );

            res.json({
                success: true,
                message: 'Profile picture uploaded successfully',
                profile_pic: profilePicPath
            });
        } catch (error) {
            console.error('Upload profile picture error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });
};

module.exports = {
    getProfile,
    updateProfile,
    uploadProfilePicture
};