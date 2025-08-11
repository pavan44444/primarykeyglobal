const db = require('../config/db');

// Add Interview Experience (Only Once Per User)
exports.addExperience = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { company_name, job_role, job_location, package_offered, experience_summary, rounds } = req.body;
        const user_id = req.user.user_id; // from JWT

        // Get user's college_id
        const [userData] = await connection.query(
            'SELECT college_id FROM users WHERE user_id = ?',
            [user_id]
        );

        if (userData.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'User not found' });
        }
        const college_id = userData[0].college_id;

        // Check if user already added experience
        const [existing] = await connection.query(
            'SELECT * FROM interview_experiences WHERE user_id = ?',
            [user_id]
        );

        if (existing.length > 0) {
            connection.release();
            return res.status(400).json({ message: 'You have already added your interview experience' });
        }

        // Start transaction
        await connection.beginTransaction();

        // Insert into interview_experiences
        const [result] = await connection.query(
            `INSERT INTO interview_experiences 
            (user_id, college_id, company_name, job_role, job_location, package_offered, experience_summary)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user_id, college_id, company_name, job_role, job_location, package_offered, experience_summary]
        );

        const experience_id = result.insertId;

        // Insert interview rounds if provided
        if (Array.isArray(rounds) && rounds.length > 0) {
            for (const round of rounds) {
                await connection.query(
                    `INSERT INTO interview_rounds 
                    (experience_id, round_number, round_type, round_description, round_date)
                    VALUES (?, ?, ?, ?, ?)`,
                    [experience_id, round.round_number, round.round_type, round.round_description, round.round_date]
                );
            }
        }

        await connection.commit();
        res.status(201).json({ message: 'Interview experience added successfully' });

    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        connection.release();
    }
};

// Fetch Interview Experiences for Same College (with Rounds)
exports.getExperiencesByCollege = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        // Get user's college_id
        const [userData] = await db.query(
            'SELECT college_id FROM users WHERE user_id = ?',
            [user_id]
        );

        if (userData.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const college_id = userData[0].college_id;

        // Fetch all experiences from that college
        const [experiences] = await db.query(
            `SELECT ie.*, u.name AS student_name
             FROM interview_experiences ie
             JOIN users u ON ie.user_id = u.user_id
             WHERE ie.college_id = ?
             ORDER BY ie.created_at DESC`,
            [college_id]
        );

        // Fetch rounds for each experience
        for (const exp of experiences) {
            const [rounds] = await db.query(
                `SELECT * FROM interview_rounds WHERE experience_id = ? ORDER BY round_number ASC`,
                [exp.experience_id]
            );
            exp.rounds = rounds;
        }

        res.json(experiences);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
