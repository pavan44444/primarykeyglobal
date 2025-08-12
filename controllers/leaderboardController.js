// const db = require("../config/db");

// const getCollegeLeaderboard = (req, res) => {
//   const { college_id } = req.params;

//   if (!college_id) {
//     return res.status(400).json({ error: "College ID is required" });
//   }

//   const sql = `
//     SELECT u.user_id, u.name, u.college_id, c.college_name AS college_name,
//            SUM(qr.points_scored) AS total_points
//     FROM quiz_results qr
//     JOIN users u ON qr.user_id = u.user_id
//     JOIN colleges c ON u.college_id = c.college_id
//     WHERE u.college_id = ?
//     GROUP BY u.user_id, u.name, u.college_id, c.college_name
//     ORDER BY total_points DESC
//     LIMIT 10
//   `;

//   db.query(sql, [college_id], (err, results) => {
//     if (err) {
//       console.error("Error fetching leaderboard:", err);
//       return res.status(500).json({ error: "Database error" });
//     }
//     res.json(results);
//   });
// };

// module.exports = { getCollegeLeaderboard };
