// controllers/questionOptionController.js

const db = require("../config/db");

// Create Option
exports.createOption = (req, res) => {
  const { question_id, option_text, is_correct, option_order } = req.body;
  const sql = `
    INSERT INTO question_options (question_id, option_text, is_correct, option_order)
    VALUES (?, ?, ?, ?)
  `;
  db.query(
    sql,
    [question_id, option_text, is_correct || false, option_order || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Option created", option_id: result.insertId });
    }
  );
};

// Get All Options
exports.getAllOptions = (req, res) => {
  const sql = "SELECT * FROM question_options";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get Options by Question ID
exports.getOptionsByQuestionId = (req, res) => {
  const question_id = req.params.question_id;
  const sql = "SELECT * FROM question_options WHERE question_id = ?";
  db.query(sql, [question_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Update Option
exports.updateOption = (req, res) => {
  const option_id = req.params.option_id;
  const { option_text, is_correct, option_order } = req.body;
  const sql = `
    UPDATE question_options
    SET option_text = ?, is_correct = ?, option_order = ?
    WHERE option_id = ?
  `;
  db.query(sql, [option_text, is_correct, option_order, option_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Option not found" });
    }
    res.json({ message: "Option updated successfully" });
  });
};

// Delete Option
exports.deleteOption = (req, res) => {
  const option_id = req.params.option_id;
  const sql = "DELETE FROM question_options WHERE option_id = ?";
  db.query(sql, [option_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Option not found" });
    }
    res.json({ message: "Option deleted successfully" });
  });
};
