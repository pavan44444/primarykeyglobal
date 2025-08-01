// middleware/checkAdmin.js
module.exports = (req, res, next) => {
  try {
    // Check if user object exists (should be set by checkAuth middleware)
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    // User is admin, proceed to next middleware/route handler
    next();
  } catch (error) {
    res.status(500).json({ message: 'Authorization check failed.' });
  }
};