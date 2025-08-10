const db = require('../config/db');

// Create a new quiz attempt
exports.createAttempt = (req, res) => {
  const {
    user_id,
    quiz_id,
    start_time,
    end_time,
    total_questions,
    questions_attempted,
    correct_answers,
    wrong_answers,
    skipped_questions,
    total_score
  } = req.body;

  if (!user_id || !quiz_id || !start_time || !total_questions) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const sql = `
    INSERT INTO quiz_attempts 
    (user_id, quiz_id, start_time, end_time, total_questions, questions_attempted, correct_answers, wrong_answers, skipped_questions, total_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    user_id,
    quiz_id,
    start_time,
    end_time || null,
    total_questions,
    questions_attempted || 0,
    correct_answers || 0,
    wrong_answers || 0,
    skipped_questions || 0,
    total_score || 0
  ], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Quiz attempt created', attempt_id: result.insertId });
  });
};

// Get all quiz attempts
exports.getAllAttempts = (req, res) => {
  db.query('SELECT * FROM quiz_attempts', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get quiz attempt by ID
exports.getAttemptById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM quiz_attempts WHERE attempt_id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Attempt not found' });
    res.json(results[0]);
  });
};

// Update quiz attempt
exports.updateAttempt = (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  db.query('UPDATE quiz_attempts SET ? WHERE attempt_id = ?', [fields, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Attempt not found' });
    res.json({ message: 'Quiz attempt updated successfully' });
  });
};

// Delete quiz attempt
exports.deleteAttempt = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM quiz_attempts WHERE attempt_id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Attempt not found' });
    res.json({ message: 'Quiz attempt deleted successfully' });
  });
};
