// routes/auth.js — User Registration & Login
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { User } = require('../models');
const { encrypt, decrypt } = require('../utils/encryption');

const sign = (id, email) =>
  jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, bloodGroup, dateOfBirth } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'name, email and password are required' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone: encrypt(phone),
      bloodGroup: encrypt(bloodGroup),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null
    });
    res.status(201).json({ token: sign(user._id, email), user: { id: user._id, name, email, bloodGroup } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: sign(user._id, email), user: { id: user._id, name: user.name, email, bloodGroup: decrypt(user.bloodGroup) } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

const crypto = require('crypto');
const nodemailer = require('nodemailer');

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate a 6-digit reset code
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save();

    // Nodemailer configuration
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: `AyuSutra <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'AyuSutra - Password Reset Code',
        text: `Your password reset code is: ${resetToken}\n\nThis code is valid for 1 hour.`
      };

      await transporter.sendMail(mailOptions);
      res.json({ message: 'Password reset code has been sent to your email.' });
    } else {
      // Fallback if environment variables are not set yet
      res.json({ 
        message: 'Password reset code generated. (Email credentials not configured in backend).', 
        test_code: resetToken 
      });
    }
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    
    const user = await User.findOne({ 
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been successfully reset' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
