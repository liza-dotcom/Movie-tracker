const jwt = require('jsonwebtoken');

// Verifies the JWT sent in the Authorization header.
// Expects header format: "Authorization: Bearer <token>"
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // splits "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    // Attach decoded payload (contains userId) to the request for use in route handlers
    req.user = decoded;
    next();
  });
}

module.exports = authenticateToken;