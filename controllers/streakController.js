const db = require("../config/db");

// Called after a successful quiz submission. Only counts if points were earned.
const updateUserStreak = async (userId, pointsEarnedToday) => {
  if (!pointsEarnedToday || pointsEarnedToday <= 0) return null;

  const today = new Date().toISOString().slice(0, 10);
  const [rows] = await db.query(
    `SELECT current_streak, longest_streak, last_active_date, last_bonus_streak
     FROM user_streaks WHERE user_id = ?`,
    [userId]
  );

  let currentStreak, longestStreak, lastBonusStreak;

  if (rows.length === 0) {
    currentStreak = 1;
    longestStreak = 1;
    lastBonusStreak = 0;
    await db.query(
      `INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_active_date, last_bonus_streak)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, currentStreak, longestStreak, today, lastBonusStreak]
    );
  } else {
    const row = rows[0];
    const lastActive = row.last_active_date
      ? new Date(row.last_active_date).toISOString().slice(0, 10)
      : null;

    if (lastActive === today) {
      return { currentStreak: row.current_streak, longestStreak: row.longest_streak, bonusAwarded: false };
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    currentStreak = lastActive === yesterday ? row.current_streak + 1 : 1;
    longestStreak = Math.max(row.longest_streak, currentStreak);
    lastBonusStreak = row.last_bonus_streak;

    await db.query(
      `UPDATE user_streaks SET current_streak = ?, longest_streak = ?, last_active_date = ? WHERE user_id = ?`,
      [currentStreak, longestStreak, today, userId]
    );
  }

  let bonusAwarded = false;
  if (currentStreak % 10 === 0 && currentStreak !== lastBonusStreak) {
    await db.query(`UPDATE users SET bonus_points = bonus_points + 50 WHERE user_id = ?`, [userId]);
    await db.query(`UPDATE user_streaks SET last_bonus_streak = ? WHERE user_id = ?`, [currentStreak, userId]);
    bonusAwarded = true;
  }

  return { currentStreak, longestStreak, bonusAwarded };
};

// Recomputes today's #1 and updates the consecutive-days-at-#1 counter.
const checkAndUpdatePrimaryKey = async () => {
  const [topRows] = await db.query(
    `SELECT user_id, name FROM users
     WHERE role != 'admin' AND total_points > 0
     ORDER BY total_points DESC, name ASC LIMIT 1`
  );
  if (topRows.length === 0) return null;
  const topUser = topRows[0];

  const [rows] = await db.query(`SELECT * FROM rank_one_streak WHERE id = 1`);
  const record = rows[0];
  const today = new Date().toISOString().slice(0, 10);

  const lastChecked = record.last_checked_date
    ? new Date(record.last_checked_date).toISOString().slice(0, 10)
    : null;

  if (lastChecked === today) {
    return { userId: record.user_id, streakDays: record.streak_days, isPrimaryKey: record.streak_days >= 5 };
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streakDays =
    record.user_id === topUser.user_id && lastChecked === yesterday
      ? record.streak_days + 1
      : 1;

  await db.query(
    `UPDATE rank_one_streak SET user_id = ?, streak_days = ?, last_checked_date = ? WHERE id = 1`,
    [topUser.user_id, streakDays, today]
  );

  return { userId: topUser.user_id, name: topUser.name, streakDays, isPrimaryKey: streakDays >= 5 };
};

const getMyStreak = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT current_streak, longest_streak, last_active_date FROM user_streaks WHERE user_id = ?`,
      [req.user.id]
    );
    res.json({ success: true, streak: rows[0] || { current_streak: 0, longest_streak: 0 } });
  } catch (err) {
    console.error("Error fetching streak:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
};

const getPrimaryKeyHolder = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.streak_days, u.user_id, u.name
       FROM rank_one_streak r JOIN users u ON r.user_id = u.user_id WHERE r.id = 1`
    );
    if (rows.length === 0 || rows[0].streak_days < 5) {
      return res.json({ success: true, primaryKey: null });
    }
    res.json({
      success: true,
      primaryKey: { user_id: rows[0].user_id, name: rows[0].name, streak_days: rows[0].streak_days }
    });
  } catch (err) {
    console.error("Error fetching primarykey holder:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
};
const getStreakHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `SELECT DATE(submitted_at) as activity_date
       FROM quiz_submissions
       WHERE user_id = ?
       GROUP BY DATE(submitted_at)
       HAVING SUM(points_earned) > 0
       ORDER BY activity_date ASC`,
      [userId]
    );

    const activeDates = rows.map(r =>
      typeof r.activity_date === 'string' ? r.activity_date : r.activity_date.toISOString().slice(0, 10)
    );

    const [streakRows] = await db.query(
      `SELECT current_streak, longest_streak FROM user_streaks WHERE user_id = ?`,
      [userId]
    );

    res.json({
      success: true,
      activeDates,
      streak: streakRows[0] || { current_streak: 0, longest_streak: 0 }
    });
  } catch (err) {
    console.error("Error fetching streak history:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
};

module.exports = { updateUserStreak, checkAndUpdatePrimaryKey, getMyStreak, getPrimaryKeyHolder, getStreakHistory };
