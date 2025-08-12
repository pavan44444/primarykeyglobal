const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Your DB connection file
const authMiddleware = require("../middleware/authMiddleware");

// Get all quizzes (topics + details)
router.get("/", authMiddleware, async (req, res) => {
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
});
// Get all questions for a specific quiz
router.get("/:quiz_id/questions", authMiddleware, async (req, res) => {
    try {
        const quizId = req.params.quiz_id;

        const [questions] = await db.query(
            `SELECT question_id, question_text, option1, option2, option3, option4
             FROM questions
             WHERE quiz_id = ?`,
            [quizId]
        );

        if (questions.length === 0) {
            return res.status(404).json({ success: false, message: "No questions found for this quiz" });
        }

        res.json({ success: true, questions });
    } catch (err) {
        console.error("Error fetching questions:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
// Submit quiz answers
router.post("/:quiz_id/submit", authMiddleware, async (req, res) => {
    const connection = await db.getConnection();
    try {
        const quizId = req.params.quiz_id;
        const { answers } = req.body; // array: [{ question_id, selected_option }]
        const userId = req.user.id;

        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ success: false, message: "No answers submitted" });
        }

        // Get user's college_id from users table
        const [userRows] = await connection.query(
            `SELECT college_id FROM users WHERE user_id = ?`,
            [userId]
        );
        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const collegeId = userRows[0].college_id;

        // Get quiz points per question
        const [quizRows] = await connection.query(
            `SELECT points_per_question FROM quizzes WHERE quiz_id = ?`,
            [quizId]
        );
        if (quizRows.length === 0) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }
        const pointsPerQuestion = quizRows[0].points_per_question;

        let totalPointsScored = 0;
        const resultsData = [];

        // Process answers
        for (let ans of answers) {
            const [questionRow] = await connection.query(
                `SELECT correct_option FROM questions WHERE question_id = ? AND quiz_id = ?`,
                [ans.question_id, quizId]
            );

            if (questionRow.length === 0) continue;

            const isCorrect = (ans.selected_option === questionRow[0].correct_option);
            const pointsScored = isCorrect ? pointsPerQuestion : 0;

            if (isCorrect) {
                totalPointsScored += pointsScored;
            }

            resultsData.push([
                quizId,
                ans.question_id,
                isCorrect ? 1 : 0,
                userId,
                collegeId,
                pointsScored
            ]);
        }

        // Insert into quiz_results table
        if (resultsData.length > 0) {
            await connection.query(
                `INSERT INTO quiz_results 
                (quiz_id, question_id, is_correct, user_id, college_id, points_scored)
                VALUES ?`,
                [resultsData]
            );
        }

        // Update leaderboard
        await connection.query(
            `INSERT INTO leaderboard (user_id, college_id, total_points)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE total_points = total_points + VALUES(total_points)`,
            [userId, collegeId, totalPointsScored]
        );

        res.json({ success: true, totalPointsScored });

    } catch (err) {
        console.error("Error submitting quiz:", err);
        res.status(500).json({ success: false, message: "Server error" });
    } finally {
        connection.release();
    }
});

module.exports = router;
