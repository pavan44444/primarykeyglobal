const db = require("../config/db");

// === Add Category (Admin Only) ===
exports.addCategory = (req, res) => {
  if (req.user.user_type !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  const { category_name, description } = req.body;
  if (!category_name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const sql = `
    INSERT INTO quiz_categories (category_name, description)
    VALUES (?, ?)
  `;
  db.query(sql, [category_name, description || null], (err) => {
    if (err) return res.status(500).json({ error: err });
    return res.status(201).json({ message: "Category added successfully" });
  });
};

// === Get Categories (All Users) ===
exports.getCategories = (req, res) => {
  const sql = `SELECT * FROM quiz_categories WHERE is_active = TRUE`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    return res.status(200).json(results);
  });
};
