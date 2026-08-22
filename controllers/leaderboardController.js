const db = require("../config/db");

// Get leaderboard for user's own college - ALL STUDENTS
// Works for users with college_id = NULL too: they get grouped into the
// "no college" pool instead of being silently excluded from every query.
const getMyCollegeLeaderboard = async (req, res) => {
  try {
    const collegeId = req.user.college_id; // may be null — that's fine now

    const sql = `
      SELECT 
        u.user_id AS user_id,
        u.name,
        u.college_id,
        COALESCE(c.college_name, 'Global') AS college_name,
        COALESCE(u.total_points, 0) AS total_points,
        (SELECT COUNT(*) FROM quiz_submissions qs WHERE qs.user_id = u.user_id) AS quizzes_taken
      FROM users u
      LEFT JOIN colleges c 
        ON u.college_id = c.college_id
      WHERE u.college_id <=> ?
        AND u.role != 'admin'
        AND u.total_points > 0
      ORDER BY u.total_points DESC, u.name ASC
      LIMIT 10
    `;

    const [results] = await db.query(sql, [collegeId]);

    res.json({
      success: true,
      leaderboard: results
    });

  } catch (err) {
    console.error("❌ Error fetching college leaderboard:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
};

// Get leaderboard for a specific college (with limit for public view)
// If college_id is passed as the literal string "null"/"none", or omitted,
// treat it as the no-college pool rather than erroring out.
const getCollegeLeaderboard = async (req, res) => {
  try {
    let { college_id } = req.params;

    if (college_id === undefined) {
      return res.status(400).json({
        success: false,
        error: "College ID is required"
      });
    }

    // Allow callers to explicitly request the "no college" bucket
    const collegeIdParam = (college_id === 'null' || college_id === 'none') ? null : college_id;

    const sql = `
      SELECT 
        u.user_id AS user_id,
        u.name,
        u.role,
        u.college_id,
        COALESCE(c.college_name, 'Global') AS college_name,
        COALESCE(u.total_points, 0) AS total_points
      FROM users u
      LEFT JOIN colleges c 
        ON u.college_id = c.college_id
      WHERE u.college_id <=> ?
        AND u.role != 'admin'
        AND u.total_points > 0
      ORDER BY u.total_points DESC, u.name ASC
      LIMIT 10
    `;

    const [results] = await db.query(sql, [collegeIdParam]);

    console.log(
      `✅ Top ${results.length} students fetched for college ${collegeIdParam ?? 'Global'}`
    );

    res.json({
      success: true,
      leaderboard: results
    });

  } catch (err) {
    console.error("❌ Error fetching leaderboard:", err);

    res.status(500).json({
      success: false,
      error: "Database error"
    });
  }
};

// All colleges leaderboard (top performers across all colleges + global users)
const getAllCollegesLeaderboard = async (req, res) => {
  try {
    const sql = `
      SELECT 
        u.user_id AS user_id, 
        u.name, u.role,
        u.college_id, 
        COALESCE(c.college_name, 'Global') AS college_name,
        u.total_points
      FROM users u 
      LEFT JOIN colleges c ON u.college_id = c.college_id
      WHERE u.role != 'admin'
        AND u.total_points > 0
      ORDER BY u.total_points DESC
      LIMIT 10
    `;

    const [results] = await db.query(sql);
    res.json({ success: true, leaderboard: results });
  } catch (err) {
    console.error("Error fetching all colleges leaderboard:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
};

// Get all colleges for dropdown
const getColleges = async (req, res) => {
  try {
    const sql = `SELECT college_id, college_name FROM colleges ORDER BY college_name`;
    const [results] = await db.query(sql);
    res.json({ success: true, colleges: results });
  } catch (err) {
    console.error("Error fetching colleges:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
};

// Get user's rank in their college (or in the global no-college pool)
const getUserRank = async (req, res) => {
  try {
    const userId = req.user.id;
    const collegeId = req.user.college_id; // may be null
    const userRole = req.user.role;

    const userSql = `
      SELECT 
        u.user_id AS user_id,
        u.name AS user_name,
        COALESCE(u.total_points, 0) AS total_points,
        COALESCE(c.college_name, 'Global') AS college_name,
        (SELECT COUNT(*) FROM quiz_submissions qs WHERE qs.user_id = u.user_id) AS quizzes_taken
      FROM users u
      LEFT JOIN colleges c 
        ON u.college_id = c.college_id
      WHERE u.user_id = ?
    `;

    const [userResult] = await db.query(userSql, [userId]);

    if (userResult.length === 0) {
      return res.json({ success: true, rank: null, message: "User not found" });
    }

    if (userRole === "admin") {
      return res.json({
        success: true,
        rank: {
          rank_position: null,
          total_points: userResult[0].total_points,
          user_name: userResult[0].user_name,
          college_name: userResult[0].college_name,
          quizzes_taken: userResult[0].quizzes_taken
        }
      });
    }

    const rankSql = `
      SELECT COUNT(*) + 1 AS rank_position
      FROM users
      WHERE college_id <=> ?
        AND role != 'admin'
        AND total_points > (
          SELECT total_points
          FROM users
          WHERE user_id = ?
        )
    `;

    const [rankResult] = await db.query(rankSql, [collegeId, userId]);

    res.json({
      success: true,
      rank: {
        rank_position: rankResult[0].rank_position,
        total_points: userResult[0].total_points,
        user_name: userResult[0].user_name,
        college_name: userResult[0].college_name,
        quizzes_taken: userResult[0].quizzes_taken
      }
    });

  } catch (err) {
    console.error("❌ Error fetching user rank:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
};

// Get detailed quiz performance for a user
const getUserQuizPerformance = async (req, res) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT 
        qs.submission_id,
        q.topic,
        q.quiz_id,
        qs.score,
        qs.correct_answers,
        qs.wrong_answers,
        qs.points_earned,
        qs.submitted_at,
        CONCAT(qs.correct_answers, '/', q.no_of_questions) as answered
      FROM quiz_submissions qs
      JOIN quizzes q ON qs.quiz_id = q.quiz_id
      WHERE qs.user_id = ?
      ORDER BY qs.submitted_at DESC
    `;

    const [results] = await db.query(sql, [userId]);
    res.json({ success: true, submissions: results });
  } catch (err) {
    console.error("Error fetching quiz performance:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
};

// Get college statistics (admin dashboard)
// If the admin's own college_id is null, this returns stats for the
// "no college" pool instead of erroring.
const getCollegeStats = async (req, res) => {
  try {
    const collegeId = req.user.college_id; // may be null

    const statsSql = `
      SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN total_points > 0 THEN 1 END) as active_students,
        COALESCE(SUM(total_points), 0) as total_points,
        COALESCE(AVG(total_points), 0) as avg_points,
        MAX(total_points) as highest_points
      FROM users
      WHERE college_id <=> ?
    `;

    const [results] = await db.query(statsSql, [collegeId]);
    res.json({ success: true, stats: results[0] });
  } catch (err) {
    console.error("Error fetching college stats:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
};

module.exports = { 
  getMyCollegeLeaderboard,  // Shows ALL students from user's college (or global pool if college_id is null)
  getCollegeLeaderboard,     // For specific college by ID (limited)
  getAllCollegesLeaderboard, // Top performers across all colleges + global users
  getColleges,               // List of all colleges
  getUserRank,               // Individual user's rank
  getUserQuizPerformance,    // User's quiz history
  getCollegeStats            // College statistics for admin
};