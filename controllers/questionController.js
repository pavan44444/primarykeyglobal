const db = require("../config/db");

// === Add Question (Admin Only) ===
exports.addQuestion = (req, res) => {
  if (req.user.user_type !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  const {
    topic_id,
    question_text,
    question_type,
    difficulty_level,
    points,
    time_limit,
    explanation
  } = req.body;

  if (!topic_id || !question_text) {
    return res.status(400).json({ message: "Topic ID and question text are required" });
  }

  // Validate topic exists
  db.query(
    "SELECT * FROM quiz_topics WHERE topic_id = ? AND is_active = TRUE",
    [topic_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.length === 0) {
        return res.status(400).json({ message: "Topic does not exist or is inactive" });
      }

      // Insert question
      const sql = `
        INSERT INTO questions 
        (topic_id, question_text, question_type, difficulty_level, points, time_limit, explanation, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(
        sql,
        [
          topic_id,
          question_text,
          question_type || "mcq",
          difficulty_level || "medium",
          points || 1,
          time_limit || 60,
          explanation || null,
          req.user.user_id
        ],
        (err) => {
          if (err) return res.status(500).json({ error: err });
          return res.status(201).json({ message: "Question added successfully" });
        }
      );
    }
  );
};

// === Get Questions (Any Logged-In User, Optional Filter by Topic) ===
exports.getQuestions = (req, res) => {
  const { topic_id } = req.query;

  let sql = `
    SELECT q.*, t.topic_name 
    FROM questions q
    JOIN quiz_topics t ON q.topic_id = t.topic_id
    WHERE q.is_active = TRUE
  `;
  let params = [];

  if (topic_id) {
    sql += " AND q.topic_id = ?";
    params.push(topic_id);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    return res.status(200).json(results);
  });
};
