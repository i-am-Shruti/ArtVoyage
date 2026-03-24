const mongoose = require('mongoose');

const userLoginSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: { type: String, default: '' },
  otp: { type: String },
  otpExpiration: { type: Date },
  verified: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { 
  timestamps: true 
});



const UserLogin = mongoose.model('UserLogin', userLoginSchema);
module.exports = UserLogin;
