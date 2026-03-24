const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserLogin = require('../models/userLogin');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateEmail, validateOTP, validatePassword } = require('../middleware/validator');

require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  let user = await UserLogin.findOne({ email: email.toLowerCase().trim() });

  if (user && user.verified) {
    return res.status(400).json({ success: false, message: 'Email already exists', showLogin: true });
  }

  if (!user) {
    user = new UserLogin({ email: email.toLowerCase().trim() });
    await user.save();
  }

  const otp = generateOTP();
  const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);

  user.otp = otp.toString();
  user.otpExpiration = otpExpiration;
  await user.save();

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Your OTP code from ArtVoyage',
    text: `Hi User,\n\nYour OTP code is: ${otp}\n\nThis OTP will expire in 5 minutes.\n\nIf you did not request this, please ignore this email.\n\nRegards,\nArtVoyage Team`,
  };

  await transporter.sendMail(mailOptions);
  res.status(200).json({ success: true, message: 'OTP sent successfully' });
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  if (!validateOTP(otp)) {
    return res.status(400).json({ success: false, message: 'Invalid OTP format' });
  }

  const user = await UserLogin.findOne({ 
    email: { $regex: new RegExp('^' + normalizedEmail + '$', 'i') }
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Email not found' });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  if (new Date() > user.otpExpiration) {
    return res.status(400).json({ success: false, message: 'OTP has expired' });
  }

  user.otp = null;
  user.otpExpiration = null;
  user.verified = true;
  await user.save();

  res.json({ success: true, message: 'OTP verified successfully!' });
});

const setPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({ success: false, message: passwordValidation.message });
  }

  const user = await UserLogin.findOne({ 
    email: { $regex: new RegExp('^' + normalizedEmail + '$', 'i') }
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Email not found' });
  }

  if (!user.verified) {
    return res.status(400).json({ success: false, message: 'User is not verified' });
  }

  user.password = await bcrypt.hash(password, 10);
  await user.save();

  res.json({ success: true, message: 'Password set successfully!' });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const user = await UserLogin.findOne({ email: { $regex: new RegExp('^' + email + '$', 'i') } });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Email not found' });
  }

  if (!user.verified) {
    return res.status(400).json({ success: false, message: 'User is not verified. Please sign up first.' });
  }

  if (!user.password) {
    return res.status(400).json({ success: false, message: 'Password not set. Please sign up and set your password.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Invalid password' });
  }

  const token = jwt.sign(
    { userId: user._id, email: user.email }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400000
  });

  res.json({ success: true, message: 'Login successful!' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  const user = await UserLogin.findOne({ email });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Email not found' });
  }

  if (!user.verified) {
    return res.status(400).json({ success: false, message: 'User is not verified' });
  }

  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 5 * 60 * 1000);
  await user.save();

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Password Reset OTP',
    text: `Your password reset OTP is: ${resetToken}\nThis OTP will expire in 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
  res.json({ success: true, message: 'Password reset OTP sent to your email' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  if (!validateEmail(normalizedEmail)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  const user = await UserLogin.findOne({ 
    email: { $regex: new RegExp('^' + normalizedEmail + '$', 'i') }
  });

  if (!user) {
    return res.json({ success: true, action: 'signup', message: 'Email not found. Please register first.' });
  }

  if (!user.password) {
    return res.json({ success: true, action: 'setPassword', message: 'Password not set. Please set your password.' });
  }

  const otp = generateOTP();
  const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
  user.otp = otp.toString();
  user.otpExpiration = otpExpiration;
  await user.save();

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Password Reset OTP',
    text: `Your password reset OTP is: ${otp}\nThis OTP will expire in 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
  res.json({ success: true, action: 'reset', message: 'Password reset OTP sent to your email.' });
});

const checkSession = (req, res) => {
  if (req.cookies.token) {
    return res.json({ success: true, loggedIn: true });
  }
  res.json({ success: true, loggedIn: false });
};

const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.json({ success: true, message: 'Logged out successfully!' });
};

module.exports = { sendOTP, verifyOTP, setPassword, login, resetPassword, forgotPassword, logout, checkSession };
