const db = require("../config/db");

// === Add Topic (Admin Only) ===
exports.addTopic = (req, res) => {
  if (req.user.user_type !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  const { subcategory_id, topic_name, description, difficulty_level } = req.body;

  if (!subcategory_id || !topic_name) {
    return res.status(400).json({ message: "Subcategory ID and topic name are required" });
  }

  // Validate subcategory exists
  db.query(
    "SELECT * FROM quiz_subcategories WHERE subcategory_id = ? AND is_active = TRUE",
    [subcategory_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.length === 0) {
        return res.status(400).json({ message: "Subcategory does not exist or is inactive" });
      }

      // Insert topic
      const sql = `
        INSERT INTO quiz_topics (subcategory_id, topic_name, description, difficulty_level)
        VALUES (?, ?, ?, ?)
      `;
      db.query(
        sql,
        [subcategory_id, topic_name, description || null, difficulty_level || "medium"],
        (err) => {
          if (err) return res.status(500).json({ error: err });
          return res.status(201).json({ message: "Topic added successfully" });
        }
      );
    }
  );
};

// === Get Topics (All Users, Optional Filter by Subcategory) ===
exports.getTopics = (req, res) => {
  const { subcategory_id } = req.query;

  let sql = `
    SELECT t.*, s.subcategory_name 
    FROM quiz_topics t
    JOIN quiz_subcategories s ON t.subcategory_id = s.subcategory_id
    WHERE t.is_active = TRUE
  `;
  let params = [];

  if (subcategory_id) {
    sql += " AND t.subcategory_id = ?";
    params.push(subcategory_id);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    return res.status(200).json(results);
  });
};
