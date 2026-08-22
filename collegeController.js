const db = require("../config/db"); // your MySQL connection

// Fetch only college names
exports.getCollegeNames = (req, res) => {
  const query = "SELECT college_id, college_name FROM colleges";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching colleges:", err);
      return res.status(500).json({ error: "Database error" });
    }

    return res.json(results);
  });
};
