const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { isAlpha, isStrongPassword } = require('validator');
const { default: isEmail } = require('validator/lib/isEmail');

const AdminModel = require('../models/adminModel');
const OTPModel = require('../models/otpModel');

module.exports.generateOTPForEmail = async (req, res) => {
  try {
    let { name, password, username, email } = req.body;

    // NAME VALIDATION STARTS
    name = name ? name.trim() : '';

    if (!('name' in req.body) || !name) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a name' });
    }

    if (!isAlpha(name, 'en-US', { ignore: ' ' })) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Name can only be alphabetic' });
    }
    // NAME VALIDATION ENDS

    // PASSWORD VAVLIDATION STARTS
    password = password ? password.trim() : '';

    if (!('password' in req.body) || !password) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a password' });
    }

    if (!isStrongPassword(password)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a Strong Password' });
    }
    // PASSWORD VAVLIDATION ENDS

    // USERNAME VAVLIDATION STARTS
    username = username ? username.trim() : '';

    if (!('username' in req.body) || !username) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a username' });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Username can only contain alphabets, number and underscore',
      });
    }

    if (await AdminModel.findOne({ username })) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Username not available' });
    }
    // USERNAME VAVLIDATION ENDS

    // EMAIl VAVLIDATION STARTS
    email = email ? email.trim() : '';

    if (!('email' in req.body) || !email) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a email' });
    }

    if (!isEmail(email)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please enter a valid email' });
    }

    if (await AdminModel.findOne({ email })) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Email is not unique' });
    }
    // EMAIl VAVLIDATION ENDS

    // CHECK IF OTP EXISTS ALREADY (IN CASE OF RESEND OTP)
    const existingOTP = await OTPModel.findOne({ email });
    if (existingOTP) {
      await existingOTP.deleteOne();
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpDocument = new OTPModel({
      otp,
      email,
      expires: Date.now() + 5 * 60 * 1000,
    });

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      service: 'gmail',
      auth: {
        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
        user: process.env.NodeMailer_email,
        pass: process.env.NodeMailer_password,
      },
    });

    // async..await is not allowed in global scope, must use a wrapper
    // send mail with defined transport object
    await transporter.sendMail({
      from: 'bilal bhai', // sender address
      to: email, // list of receivers
      subject: 'Hello ✔', // Subject line
      text: `yeh tera otp hai ${otp}`, // plain text body
    });

    await otpDocument.save();

    return res
      .status(200)
      .json({ status: 'success', message: 'OTP Sent to your email' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports.verifyOTPForEmail = async (req, res) => {
  try {
    let { email, otp } = req.body;

    // EMAIl VAVLIDATION STARTS
    email = email ? email.trim() : '';

    if (!('email' in req.body) || !email) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a email' });
    }

    if (!isEmail(email)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please enter a valid email' });
    }

    if (await AdminModel.findOne({ email })) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Email is not unique' });
    }
    // EMAIl VAVLIDATION ENDS

    // OTP VAVLIDATION STARTS
    otp = otp ? otp.trim() : '';

    if (!('otp' in req.body) || !otp) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a otp' });
    }
    // OTP VAVLIDATION ENDS

    const otpExists = await OTPModel.findOne({ email, otp });
    if (!otpExists) {
      return res.status(200).json({ status: 'fail', message: 'Invalid OTP' });
    }

    if (otpExists.expires < Date.now()) {
      await otpExists.deleteOne();
      return res.status(200).json({
        status: 'fail',
        message: 'OTP Expired. Please request otp again',
      });
    }

    await otpExists.deleteOne();

    const verifiedEmailToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: '10m',
    });

    return res.status(200).json({
      status: 'success',
      message: 'OTP Verified Successfully',
      verifiedEmailToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports.registerUser = async (req, res) => {
  try {
    let { name, email, password, username } = req.body;

    // NAME VALIDATION STARTS
    name = name ? name.trim() : '';

    if (!('name' in req.body) || !name) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a name' });
    }

    if (!isAlpha(name, 'en-US', { ignore: ' ' })) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Name can only be alphabetic' });
    }
    // NAME VALIDATION ENDS

    // PASSWORD VAVLIDATION STARTS
    password = password ? password.trim() : '';

    if (!('password' in req.body) || !password) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a password' });
    }

    if (!isStrongPassword(password)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a Strong Password' });
    }
    // PASSWORD VAVLIDATION ENDS

    // USERNAME VAVLIDATION STARTS
    username = username ? username.trim() : '';

    if (!('username' in req.body) || !username) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a username' });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Username can only contain alphabets, number and underscore',
      });
    }

    if (await AdminModel.findOne({ username })) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Username not available' });
    }
    // USERNAME VAVLIDATION ENDS

    // EMAIl VAVLIDATION STARTS
    email = email ? email.trim() : '';

    if (!('email' in req.body) || !email) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a email' });
    }

    if (!isEmail(email)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please enter a valid email' });
    }

    if (await AdminModel.findOne({ email })) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Email is not unique' });
    }
    // EMAIl VAVLIDATION ENDS

    if (req.emailFromToken !== email) {
      return res.status(400).json({
        status: 'fail',
        message: 'You are not the same person who verified his otp',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new AdminModel({
      name,
      email,
      password: hashedPassword,
      username,
    });

    await newAdmin.save();

    return res
      .status(200)
      .json({ status: 'success', message: 'New admin created successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports.login = async (req, res) => {
  try {
    let { emailOrUsername, password } = req.body;

    // emailOrUsername VALIDATION STARTS

    emailOrUsername = emailOrUsername ? emailOrUsername.trim() : '';

    if (!('emailOrUsername' in req.body) || !emailOrUsername) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a emailOrUsername' });
    }

    // emailOrUsername VALIDATION ENDS

    // password VALIDATION STARTS
    password = password ? password.trim() : '';

    if (!('password' in req.body) || !password) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a password' });
    }
    // password VALIDATION ENDS
    const user = await AdminModel.findOne({
      $or: [
        {
          email: emailOrUsername,
        },
        {
          username: emailOrUsername,
        },
      ],
    });

    if (!user) {
      return res.status(200).json({
        status: 'fail',
        message: 'Account with this username or email not found',
      });
    }

    console.log(user);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Invalid credentials' });
    }

    const authToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    return res
      .status(200)
      .json({ status: 'success', message: 'Login Successfully', authToken });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports.generateOTPForExistingEmail = async (req, res) => {
  try {
    let { email } = req.body;

    // EMAIl VAVLIDATION STARTS
    email = email ? email.trim() : '';

    if (!('email' in req.body) || !email) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a email' });
    }

    if (!isEmail(email)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please enter a valid email' });
    }

    if (!(await AdminModel.findOne({ email }))) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Email is not unique' });
    }
    // EMAIl VAVLIDATION ENDS

    // CHECK IF OTP EXISTS ALREADY (IN CASE OF RESEND OTP)
    const existingOTP = await OTPModel.findOne({ email });
    if (existingOTP) {
      await existingOTP.deleteOne();
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpDocument = new OTPModel({
      otp,
      email,
      expires: Date.now() + 5 * 60 * 1000,
    });

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      service: 'gmail',
      auth: {
        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
        user: process.env.NodeMailer_email,
        pass: process.env.NodeMailer_password,
      },
    });

    // async..await is not allowed in global scope, must use a wrapper
    // send mail with defined transport object
    await transporter.sendMail({
      from: 'bilal bhai', // sender address
      to: email, // list of receivers
      subject: 'Hello ✔', // Subject line
      text: `yeh tera otp hai ${otp}`, // plain text body
    });

    await otpDocument.save();

    return res
      .status(200)
      .json({ status: 'success', message: 'OTP Sent to your email' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports.verifyOTPForExistingEmail = async (req, res) => {
  try {
    let { email, otp } = req.body;

    // EMAIl VAVLIDATION STARTS
    email = email ? email.trim() : '';

    if (!('email' in req.body) || !email) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a email' });
    }

    if (!isEmail(email)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please enter a valid email' });
    }

    if (!(await AdminModel.findOne({ email }))) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Email is not unique' });
    }
    // EMAIl VAVLIDATION ENDS

    // OTP VAVLIDATION STARTS
    otp = otp ? otp.trim() : '';

    if (!('otp' in req.body) || !otp) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a otp' });
    }
    // OTP VAVLIDATION ENDS

    const otpExists = await OTPModel.findOne({ email, otp });
    if (!otpExists) {
      return res.status(200).json({ status: 'fail', message: 'Invalid OTP' });
    }

    if (otpExists.expires < Date.now()) {
      await otpExists.deleteOne();
      return res.status(200).json({
        status: 'fail',
        message: 'OTP Expired. Please request otp again',
      });
    }

    await otpExists.deleteOne();

    const verifiedEmailToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: '10m',
    });

    return res.status(200).json({
      status: 'success',
      message: 'OTP Verified Successfully',
      verifiedEmailToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports.changePasswordForExistingEmail = async (req, res) => {
  try {
    let { email, newPassword } = req.body;

    // EMAIl VAVLIDATION STARTS
    email = email ? email.trim() : '';

    if (!('email' in req.body) || !email) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a email' });
    }

    if (!isEmail(email)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please enter a valid email' });
    }

    if (await AdminModel.findOne({ email })) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Email is not unique' });
    }
    // EMAIl VAVLIDATION ENDS

    if (req.emailFromToken !== email) {
      return res.status(400).json({
        status: 'fail',
        message: 'You are not the same person who verified his otp',
      });
    }

    // PASSWORD VAVLIDATION STARTS
    newPassword = newPassword ? newPassword.trim() : '';

    if (!('newPassword' in req.body) || !newPassword) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a newPassword' });
    }

    if (!isStrongPassword(newPassword)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a Strong Password' });
    }
    // PASSWORD VAVLIDATION ENDS

    const user = await AdminModel.findOne({ email });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res
      .status(200)
      .json({ status: 'success', message: 'Password changed successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
