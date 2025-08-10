const db = require("../config/db");

// === Add Subcategory (Admin Only) ===
exports.addSubcategory = (req, res) => {
  if (req.user.user_type !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  const { category_id, subcategory_name, description } = req.body;

  if (!category_id || !subcategory_name) {
    return res.status(400).json({ message: "Category ID and subcategory name are required" });
  }

  // Validate category exists
  db.query("SELECT * FROM quiz_categories WHERE category_id = ? AND is_active = TRUE", [category_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) {
      return res.status(400).json({ message: "Category does not exist or is inactive" });
    }

    // Insert subcategory
    const sql = `
      INSERT INTO quiz_subcategories (category_id, subcategory_name, description)
      VALUES (?, ?, ?)
    `;
    db.query(sql, [category_id, subcategory_name, description || null], (err) => {
      if (err) return res.status(500).json({ error: err });
      return res.status(201).json({ message: "Subcategory added successfully" });
    });
  });
};

// === Get All Subcategories (Any User) ===
exports.getSubcategories = (req, res) => {
  const sql = `
    SELECT sc.*, c.category_name 
    FROM quiz_subcategories sc
    JOIN quiz_categories c ON sc.category_id = c.category_id
    WHERE sc.is_active = TRUE
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    return res.status(200).json(results);
  });
};
