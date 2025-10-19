import crypto from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import Email from '../utils/email.js';
import { createSendToken, signToken } from '../middleware/auth.js';

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Forgot password via OTP (Step 1: send OTP)

// Reset password using OTP (Step 2: verify OTP and set new password)
// Send OTP for email verification
export const sendOTP = async (req, res, next) => {
  try {
    const { email, name } = req.body || {};
    if (!email) {
      return res.status(400).json({ status: 'fail', message: 'Please provide an email address' });
    }

    let user = await User.findOne({ email });
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (user) {
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save({ validateBeforeSave: false });
    } else {
      user = await User.create({
        email,
        name: name || 'New User',
        otp,
        otpExpires,
        isVerified: false
      });
    }

    const verificationUrl = `${req.protocol}://${req.get('host')}/verify-email?otp=${otp}&email=${encodeURIComponent(email)}`;
    await new Email(user, verificationUrl, otp).sendOTP();
    return res.status(200).json({ status: 'success', message: 'OTP sent to email' });
  } catch (err) {
    console.error('[AUTH] sendOTP error:', err?.message);
    return res.status(500).json({ status: 'error', message: 'Failed to send OTP' });
  }
};

// Signup a new user
export const signup = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm, phone } = req.body;
    if (process.env.NODE_ENV !== 'production') {
      console.log('[AUTH] signup called', { email });
    }

    // 1) Check if passwords match
    if (password !== passwordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message: 'Passwords do not match',
      });
    }

    // 2) Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If user exists and is verified
      return res.status(400).json({
        status: 'fail',
        message: 'User with this email already exists. Please log in instead.',
      });
    }

    // 3) Create new user (not verified), send OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    const newUser = await User.create({
      name,
      email,
      password,
      phone,
      otp,
      otpExpires,
      isVerified: false
    });
    const verifyUrl = `${req.protocol}://${req.get('host')}/verify-email?otp=${otp}&email=${encodeURIComponent(email)}`;
    await new Email(newUser, verifyUrl, otp).sendOTP();
    return res.status(201).json({ status: 'success', message: 'OTP sent to your email. Please verify your account.' });
  } catch (err) {
    console.error('[AUTH] signup handler error:', err?.message);
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Verify OTP
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({ status: 'fail', message: 'Email and OTP are required' });
    }
    const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ status: 'fail', message: 'Invalid or expired OTP' });
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });
    // Auto-login upon successful verification
    return createSendToken(user, 200, req, res);
  } catch (err) {
    console.error('[AUTH] verifyOTP error:', err?.message);
    return res.status(500).json({ status: 'error', message: 'Error verifying OTP' });
  }
};

// Resend OTP
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ status: 'fail', message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: 'fail', message: 'No user found with this email' });
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    const verificationUrl = `${req.protocol}://${req.get('host')}/verify-email?otp=${otp}&email=${encodeURIComponent(email)}`;
    await new Email(user, verificationUrl, otp).sendOTP();
    return res.status(200).json({ status: 'success', message: 'OTP resent successfully' });
  } catch (err) {
    console.error('[AUTH] resendOTP error:', err?.message);
    return res.status(500).json({ status: 'error', message: 'Failed to resend OTP' });
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password',
      });
    }

    // 2) Normalize email and fetch user regardless of active to give clearer messages
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password +role +active');

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password',
      });
    }

    // 3) Check if user is active
    if (user.active === false) {
      return res.status(401).json({
        status: 'fail',
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // 4) Check password correctness
   // Compare plain text passwords (no encryption)
if (user.password !== password) {
  return res.status(401).json({
    status: 'fail',
    message: 'Incorrect email or password',
  });
}

    // Require email verification before login
  if (!user.isVerified) {
    return res.status(401).json({ status: 'fail', message: 'Please verify your email address first' });
  }

    // 6) Generate session ID for tracking
    const sessionId = crypto.randomBytes(16).toString('hex');
    user.activeSessions = user.activeSessions || [];
    user.activeSessions.push({
      sessionId,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      lastActivity: Date.now()
    });

    // Keep only the 5 most recent sessions
    if (user.activeSessions.length > 5) {
      user.activeSessions = user.activeSessions.slice(-5);
    }

    await user.save({ validateBeforeSave: false });

    // 7) Set session cookie
    if (rememberMe) {
      // Set longer expiry for 'remember me' (30 days)
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      // Default session (expires when browser closes)
      req.session.cookie.expires = false;
    }

    // 8) Store user info in session
    req.session.userId = user._id;
    req.session.sessionId = sessionId;

    // 9) Send token to client
    createSendToken(user, 200, req, res);
  } catch (err) {
    console.error('Login error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
      keyPattern: err.keyPattern,
      keyValue: err.keyValue
    });
    
    // More specific error messages based on error type
    let errorMessage = 'An error occurred during login';
    if (err.name === 'ValidationError') {
      errorMessage = Object.values(err.errors).map(val => val.message).join('. ');
    } else if (err.code === 11000) {
      errorMessage = 'A user with this email already exists';
    } else if (err.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token. Please log in again!';
    } else if (err.name === 'TokenExpiredError') {
      errorMessage = 'Your token has expired! Please log in again.';
    }
    
    res.status(500).json({
      status: 'error',
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  }
};

// Google OAuth login/signup
export const googleAuth = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    // 1) Verify the Google token
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // 2) Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        name,
        email,
        photo: picture,
        password: crypto.randomBytes(12).toString('hex'), // Random password
        isVerified: true, // Google-verified emails are considered verified
      });
    }

    // 3) Log the user in
    createSendToken(user, 200, req, res);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error authenticating with Google',
    });
  }
};



// Forgot password (via reset link)
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'There is no user with that email address',
      });
    }

    // Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    // Send email (using your Email class)
    try {
      await new Email(user, resetURL).sendPasswordReset();
      return res.status(200).json({
        status: 'success',
        message: 'Password reset link sent to your email!',
      });
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr.message);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending the email. Try again later.',
      });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error processing your request',
    });
  }
};

// Reset password (via token link)
export const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or has expired',
      });
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, req, res);
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error resetting password',
    });
  }
};

// Forgot password via OTP
export const forgotPasswordOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ status: 'fail', message: 'Please provide your email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'No user found with that email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // valid 10 min
    await user.save({ validateBeforeSave: false });

    // Send email with OTP
    await new Email(user, null, otp).sendPasswordResetOTP();

    return res.status(200).json({
      status: 'success',
      message: 'OTP sent to your email for password reset',
    });
  } catch (err) {
    console.error('Forgot Password OTP Error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error sending OTP. Try again later.',
    });
  }
};

// Reset password using OTP
export const resetPasswordByOTP = async (req, res, next) => {
  try {
    const { email, otp, newPassword, newPasswordConfirm } = req.body;

    if (!email || !otp || !newPassword || !newPasswordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message: 'Missing required fields',
      });
    }

    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid or expired OTP',
      });
    }

    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    createSendToken(user, 200, req, res);
  } catch (err) {
    console.error('Reset Password by OTP Error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error resetting password using OTP',
    });
  }
};

// Update password (for logged-in users)
export const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Your current password is wrong',
      });
    }

    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    await user.save();

    createSendToken(user, 200, req, res);
  } catch (err) {
    console.error('Update Password Error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error updating password',
    });
  }
};


// Logout user
export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  
  res.status(200).json({ status: 'success' });
};

// Refresh token - verify existing cookie and issue a fresh JWT
export const refreshToken = async (req, res) => {
  try {
    // Prefer cookie, but accept Authorization: Bearer <token> or body.token as fallback
    let token = req.cookies?.jwt;
    if (!token) {
      const auth = req.headers.authorization || req.headers.Authorization;
      if (auth && /^Bearer\s+/i.test(auth)) token = auth.split(/\s+/)[1];
      if (!token && req.body?.token) token = String(req.body.token);
      if (!token && process.env.DEBUG_COOKIES === 'true') {
        console.warn('[AUTH] refreshToken: no jwt cookie and no bearer token found');
      }
    }

    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'Not authenticated' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ status: 'fail', message: 'Invalid or expired token' });
    }

    // Ensure user exists and is active (active is select:false by default)
    const user = await User.findById(decoded.id).select('+role +active');
    if (!user || user.active === false) {
      return res.status(401).json({ status: 'fail', message: 'User not found or inactive' });
    }

    // Issue fresh token and set cookie
    createSendToken(user, 200, req, res);
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Could not refresh token' });
  }
};

// Get current user
export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Update user data
export const updateMe = async (req, res, next) => {
  try {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message: 'This route is not for password updates. Please use /updateMyPassword',
      });
    }

    // 2) Filtered out unwanted fields that are not allowed to be updated
    const filteredBody = {};
    const allowedFields = ['name', 'email', 'phone', 'photo'];
    
    Object.keys(req.body).forEach(el => {
      if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
    });

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating user data',
    });
  }
};

// Delete my account
export const deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting account',
    });
  }
};
