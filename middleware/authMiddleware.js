const jwt = require("jsonwebtoken");
const JWT_SECRET = "your_secret_key_here";

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // contains user_id, email, user_type
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
