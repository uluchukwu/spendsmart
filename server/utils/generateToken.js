const jwt = require('jsonwebtoken');

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Signs a JWT and sets it as an HTTP-only cookie on the response.
 * Cookie maxAge is kept in sync with the JWT expiry (7 days).
 */
const generateToken = (res, userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge:   SEVEN_DAYS_MS,
  });

  return token;
};

module.exports = generateToken;
