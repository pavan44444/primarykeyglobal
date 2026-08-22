const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // ✅ move to .env

module.exports = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Invalid token format." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // ✅ Attach only needed fields to req.user
        req.user = {
            id: decoded.user_id || decoded.id,   // support both naming styles
            email: decoded.email,
            role: decoded.role,
            college_id: decoded.college_id,      // 🔑 now available in controllers
        };

        next();
    } catch (err) {
        console.error("JWT verification failed:", err.message);
        res.status(403).json({ message: "Invalid or expired token" });
    }
};
