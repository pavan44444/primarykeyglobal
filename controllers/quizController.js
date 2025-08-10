const db = require("../config/db");

// Create Quiz
exports.createQuiz = (req, res) => {
    const {
        quiz_name,
        description,
        topic_id,
        college_id,
        company_id,
        total_questions,
        total_time,
        total_points,
        difficulty_level,
        is_active,
        is_public,
        created_by
    } = req.body;

    if (!quiz_name || !total_questions || !total_time || !total_points || !created_by) {
        return res.status(400).json({ error: "Required fields missing" });
    }

    const sql = `
        INSERT INTO quizzes
        (quiz_name, description, topic_id, college_id, company_id, total_questions, total_time, total_points, difficulty_level, is_active, is_public, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(sql, [
        quiz_name,
        description || null,
        topic_id || null,
        college_id || null,
        company_id || null,
        total_questions,
        total_time,
        total_points,
        difficulty_level || "mixed",
        is_active !== undefined ? is_active : true,
        is_public !== undefined ? is_public : false,
        created_by
    ], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Quiz created", quiz_id: result.insertId });
    });
};

// Get All Quizzes
exports.getAllQuizzes = (req, res) => {
    db.query("SELECT * FROM quizzes", (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
};

// Get Quiz by ID
exports.getQuizById = (req, res) => {
    const quizId = req.params.quiz_id;
    
    db.query("SELECT * FROM quizzes WHERE quiz_id = ?", [quizId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Quiz not found" });
        }
        res.json(results[0]);
    });
};

// Update Quiz
exports.updateQuiz = (req, res) => {
    const quizId = req.params.quiz_id;
    const fields = req.body;
    
    // Build dynamic update query
    const updateFields = Object.keys(fields);
    const updateValues = Object.values(fields);
    
    if (updateFields.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
    }
    
    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const sql = `UPDATE quizzes SET ${setClause} WHERE quiz_id = ?`;
    
    db.query(sql, [...updateValues, quizId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Quiz not found" });
        }
        res.json({ message: "Quiz updated successfully" });
    });
};

// Delete Quiz
exports.deleteQuiz = (req, res) => {
    const quizId = req.params.quiz_id;
    
    db.query("DELETE FROM quizzes WHERE quiz_id = ?", [quizId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Quiz not found" });
        }
        res.json({ message: "Quiz deleted successfully" });
    });
};