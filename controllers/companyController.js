const db = require('../config/db');

// Fetch companies visited to the logged-in user's college
exports.getCompaniesByCollege = async (req, res) => {
    try {
        const user_id = req.user.user_id; // from JWT

        // Get user's college_id
        const [userData] = await db.query(
            'SELECT college_id FROM users WHERE user_id = ?',
            [user_id]
        );

        if (userData.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const college_id = userData[0].college_id;

        // Fetch companies that visited this college
        const [companies] = await db.query(
            `SELECT c.company_id, c.company_name, c.website_url,
                    m.visit_date, m.job_role, m.package_offered, m.eligibility_criteria, 
                    m.visit_status, m.is_active
             FROM company_college_mapping m
             JOIN companies c ON m.company_id = c.company_id
             WHERE m.college_id = ?
             ORDER BY m.visit_date DESC`,
            [college_id]
        );

        res.json(companies);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
