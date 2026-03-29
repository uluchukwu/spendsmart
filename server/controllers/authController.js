const asyncHandler  = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const User          = require('../models/User');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error('Email already registered');
  }

  const user = await User.create({ name, email, password });
  generateToken(res, user._id);

  res.status(201).json({
    success: true,
    data: { id: user._id, name: user.name, email: user.email, currency: user.currency },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  generateToken(res, user._id);

  res.json({
    success: true,
    data: { id: user._id, name: user.name, email: user.email, currency: user.currency },
  });
});

// POST /api/auth/logout
const logout = asyncHandler(async (_req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires:  new Date(0),
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure:   process.env.NODE_ENV === 'production',
  });
  res.json({ success: true, data: {} });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const { _id: id, name, email, currency, createdAt } = req.user;
  res.json({ success: true, data: { id, name, email, currency, createdAt } });
});

module.exports = { register, login, logout, getMe };
