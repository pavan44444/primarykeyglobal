// middleware/checkAuth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // 1. Get the token from the header
    const token = req.headers.authorization.split(' ')[1]; // Assuming format 'Bearer TOKEN'

    // 2. Verify the token using your secret key
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 3. Attach the decoded user data to the request object
    req.user = {
      id: decodedToken.userId,
      role: decodedToken.role, // Assuming you added role to the JWT payload
      email: decodedToken.email
    };

    // 4. Pass control to the next function (the route handler)
    next();

  } catch (error) {
    // 5. Handle any errors (token missing, invalid, expired)
    res.status(401).json({ message: 'Authentication failed.' });
  }
};