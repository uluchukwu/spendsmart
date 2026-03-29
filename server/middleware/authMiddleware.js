const jwt        = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User       = require('../models/User');

/**
 * Verifies the JWT stored in the HTTP-only cookie.
 * Attaches the authenticated user to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401);
    throw new Error('Not authorised — please log in');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    res.status(401);
    throw new Error('User not found — token may be stale');
  }

  req.user = user;
  next();
});

module.exports = { protect };
