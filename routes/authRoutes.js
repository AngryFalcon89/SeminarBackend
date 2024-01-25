const express = require('express');
const {
  generateOTPForEmail,
  verifyOTPForEmail,
  registerUser,
  login,
  generateOTPForExistingEmail,
  verifyOTPForExistingEmail,
  changePasswordForExistingEmail,
} = require('../controllers/authController');
const { verifiedEmailToken } = require('../middleware/jwtMiddleware');

const router = express.Router();

// REGISTER A NEW ADMIN
router.post('/generate-otp-for-email', generateOTPForEmail);
router.post('/verify-otp-for-email', verifyOTPForEmail);
router.post('/register-user', verifiedEmailToken, registerUser);

// LOGIN
router.post('/login', login);

// FORGOT PASSWORD
router.post('/generate-otp-for-existing-email', generateOTPForExistingEmail);
router.post('/verify-otp-for-exsiting-email', verifyOTPForExistingEmail);
router.post(
  'change-password-for-existing-email',
  verifiedEmailToken,
  changePasswordForExistingEmail
);

module.exports = router;
