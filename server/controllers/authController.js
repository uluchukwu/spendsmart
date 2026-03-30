const crypto        = require('crypto');
const asyncHandler  = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const sendEmail     = require('../utils/sendEmail');
const User          = require('../models/User');

// ── POST /api/auth/register ───────────────────────────────────
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

// ── POST /api/auth/login ──────────────────────────────────────
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

// ── POST /api/auth/logout ─────────────────────────────────────
const logout = asyncHandler(async (_req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires:  new Date(0),
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure:   process.env.NODE_ENV === 'production',
  });
  res.json({ success: true, data: {} });
});

// ── GET /api/auth/me ──────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  const { _id: id, name, email, currency, createdAt } = req.user;
  res.json({ success: true, data: { id, name, email, currency, createdAt } });
});

// ── POST /api/auth/forgot-password ───────────────────────────
// Always returns success to prevent email enumeration attacks
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  // Generic response regardless of whether the email exists
  const OK = { success: true, message: 'If that email is registered, a reset link has been sent.' };

  if (!user) return res.json(OK);

  // Generate token and save its hash to DB
  const rawToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const clientUrl  = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl   = `${clientUrl}/reset-password/${rawToken}`;

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;
                background:#13141f;color:#e2e4f0;border-radius:16px;">
      <h2 style="color:#6c63ff;margin-top:0;">Reset your SpendSmart password</h2>
      <p>We received a request to reset the password for your account (<strong>${user.email}</strong>).</p>
      <p>Click the button below within <strong>30 minutes</strong> to set a new password:</p>
      <a href="${resetUrl}"
         style="display:inline-block;margin:20px 0;padding:14px 28px;
                background:#6c63ff;color:#fff;border-radius:10px;
                text-decoration:none;font-weight:700;font-size:1rem;">
        Reset Password
      </a>
      <p style="color:#8b90b8;font-size:.85rem;">
        If you didn't request this, you can safely ignore this email — your password won't change.
      </p>
      <hr style="border-color:#2a2d3e;margin:24px 0;" />
      <p style="color:#8b90b8;font-size:.78rem;">
        Or copy this link into your browser:<br/>
        <a href="${resetUrl}" style="color:#6c63ff;word-break:break-all;">${resetUrl}</a>
      </p>
    </div>
  `;

  try {
    await sendEmail({ to: user.email, subject: 'SpendSmart — Reset your password', html });
    res.json(OK);
  } catch (err) {
    // Roll back the token so the user can try again
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error('Email could not be sent. Please try again later.');
  }
});

// ── PUT /api/auth/reset-password/:token ──────────────────────
const resetPassword = asyncHandler(async (req, res) => {
  // Hash the URL token to compare with the stored hash
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken:  hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    res.status(400);
    throw new Error('Reset link is invalid or has expired. Please request a new one.');
  }

  // Set new password and clear reset fields
  user.password            = req.body.password;
  user.resetPasswordToken  = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Log the user in automatically after reset
  generateToken(res, user._id);

  res.json({
    success: true,
    message: 'Password reset successfully.',
    data:    { id: user._id, name: user.name, email: user.email, currency: user.currency },
  });
});

module.exports = { register, login, logout, getMe, forgotPassword, resetPassword };
