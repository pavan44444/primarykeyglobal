const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // MySQL connection file

const JWT_SECRET = 'your_jwt_secret'; // Change this to env variable

// Register User
exports.register = async (req, res) => {
    try {
        const { name, email, password, college, city, role } = req.body;

        // Check if user already exists
        const [userExists] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (userExists.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Get college_id from colleges table
        const [collegeData] = await db.query('SELECT college_id FROM colleges WHERE college_name = ?', [college]);
        if (collegeData.length === 0) {
            return res.status(400).json({ message: 'College not found' });
        }
        const college_id = collegeData[0].college_id;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        await db.query(
            `INSERT INTO users (name, email, password_hash, college, city, role, college_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, college, city, role || 'user', college_id]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = users[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, user: { id: user.user_id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
