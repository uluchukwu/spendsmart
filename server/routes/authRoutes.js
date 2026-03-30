const express  = require('express');
const {
  register, login, logout, getMe,
  forgotPassword, resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  registerValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
} = require('../validators/authValidators');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.post('/register',                registerValidators,       validate, register);
router.post('/login',                   loginValidators,          validate, login);
router.post('/logout',                  logout);
router.get ('/me',                      protect, getMe);
router.post('/forgot-password',         forgotPasswordValidators, validate, forgotPassword);
router.put ('/reset-password/:token',   resetPasswordValidators,  validate, resetPassword);

module.exports = router;
