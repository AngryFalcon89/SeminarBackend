const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    otp: String,
    email: String,
    expires: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('OTP', otpSchema);
