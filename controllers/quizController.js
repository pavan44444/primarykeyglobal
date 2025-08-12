const db = require("../config/db");

exports.getAllQuizzes = async (req, res) => {
    try {
        const [quizzes] = await db.query(
            `SELECT quiz_id, topic, topic_id, no_of_questions, time_seconds, points_per_question, total_points
             FROM quizzes`
        );
        res.json({ success: true, quizzes });
    } catch (err) {
        console.error("Error fetching quizzes:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
