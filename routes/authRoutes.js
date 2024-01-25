const express = require('express');
const {
  generateOTPForEmail,
  verifyOTPForEmail,
  registerUser,
  login,
} = require('../controllers/authController');
const { verifiedEmailToken } = require('../middleware/jwtMiddleware');

const router = express.Router();

router.post('/generate-otp-for-email', generateOTPForEmail);
router.post('/verify-otp-for-email', verifyOTPForEmail);
router.post('/register-user', verifiedEmailToken, registerUser);

router.post('/login', login);

module.exports = router;
