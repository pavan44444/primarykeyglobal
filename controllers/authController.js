const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "your_secret_key_here";

// === REGISTER ===
exports.registerUser = async (req, res) => {
  const {
    email,
    password,
    first_name,
    last_name,
    phone,
    user_type,
    college_id,
    graduation_year,
    branch,
    profile_picture_url
  } = req.body;

  if (!email || !password || !first_name || !last_name || !user_type) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  db.query("SELECT * FROM user WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO user 
      (email, password_hash, first_name, last_name, phone, user_type, college_id, graduation_year, branch, profile_picture_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sql,
      [email, hashedPassword, first_name, last_name, phone, user_type, college_id, graduation_year, branch, profile_picture_url],
      (err) => {
        if (err) return res.status(500).json({ error: err });
        return res.status(201).json({ message: "User registered successfully" });
      }
    );
  });
};

// === LOGIN ===
exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  db.query("SELECT * FROM user WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, user_type: user.user_type },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type
      }
    });
  });
};
