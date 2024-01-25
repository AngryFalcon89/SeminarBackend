const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const AdminModel = require('../models/adminModel');
const OTPModel = require('../models/otpModel');

module.exports.generateOTPForEmail = async (req, res) => {
  try {
    const { name, password, username, email } = req.body;

    if (await AdminModel.findOne({ username })) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Username not available' });
    }

    if (await AdminModel.findOne({ email })) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Email is not unique' });
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
    const { email, otp } = req.body;

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
    const { name, email, password, username } = req.body;

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
    const { emailOrUsername, password } = req.body;

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
