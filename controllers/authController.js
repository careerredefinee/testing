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
export const forgotPasswordOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'There is no user with that email address' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    try {
      const url = `${req.protocol}://${req.get('host')}/reset-password-otp`; // informational
      await new Email(user, url, otp).sendPasswordResetOTP();
      return res.status(200).json({ status: 'success', message: 'OTP sent to email' });
    } catch (err) {
      return res.status(500).json({ status: 'error', message: 'Error sending OTP email. Try again later!' });
    }
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Error processing your request' });
  }
};

// Reset password using OTP (Step 2: verify OTP and set new password)
export const resetPasswordByOTP = async (req, res, next) => {
  try {
    const { email, otp, password, passwordConfirm } = req.body;
    if (!email || !otp || !password || !passwordConfirm) {
      return res.status(400).json({ status: 'fail', message: 'Email, OTP, password and passwordConfirm are required' });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ status: 'fail', message: 'Passwords do not match' });
    }

    const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } }).select('+password');
    if (!user) {
      return res.status(400).json({ status: 'fail', message: 'Invalid or expired OTP' });
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({ status: 'success', message: 'Password reset successful' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Error resetting password' });
  }
};

// Send OTP for email verification
export const sendOTP = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (process.env.NODE_ENV !== 'production') {
      console.log('[AUTH] sendOTP called', { email, name });
    }

    // 1) Check if email exists
    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide an email address',
      });
    }

    // 2) Check if user already exists
    let user = await User.findOne({ email });
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    if (process.env.NODE_ENV !== 'production') {
      console.log('[AUTH] sendOTP generated', { email, otp, otpExpires });
    }

    if (user) {
      // Update existing user with new OTP
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save({ validateBeforeSave: false });
    if (process.env.NODE_ENV !== 'production') {
      console.log('[AUTH] verifyOTP success', { email });
    }
    } else {
      // Create temporary user if not exists
      user = await User.create({
        email,
        name: name || 'New User',
        otp,
        otpExpires,
        isVerified: false
      });
    }

    // 3) Send OTP via email
    try {
      const verificationUrl = `${req.protocol}://${req.get('host')}/verify-email?otp=${otp}&email=${encodeURIComponent(email)}`;
      if (process.env.NODE_ENV !== 'production') {
        console.log('[AUTH] sendOTP sending email', { to: email, verificationUrl });
      }
      await new Email(user, verificationUrl, otp).sendOTP();

      res.status(200).json({
        status: 'success',
        message: 'OTP sent successfully',
      });
    } catch (err) {
      console.error('[AUTH] sendOTP email error:', err?.message);
      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending the OTP. Please try again later.',
      });
    }
  } catch (err) {
    console.error('[AUTH] sendOTP handler error:', err?.message);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while processing your request',
    });
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
      // If user exists but is not verified, resend OTP
      if (!existingUser.isVerified) {
        const otp = generateOTP();
        existingUser.otp = otp;
        existingUser.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await existingUser.save({ validateBeforeSave: false });
        if (process.env.NODE_ENV !== 'production') {
          console.log('[AUTH] signup existing unverified user -> OTP regenerated', { email, otp });
        }
        
        // Send new OTP
        const verificationUrl = `${req.protocol}://${req.get('host')}/verify-email?otp=${otp}&email=${encodeURIComponent(email)}`;
        try {
          if (process.env.NODE_ENV !== 'production') {
            console.log('[AUTH] signup resend OTP sending email', { to: email, verificationUrl });
          }
          await new Email(existingUser, verificationUrl, otp).sendOTP();
          return res.status(200).json({
            status: 'success',
            message: 'Account not verified. New OTP sent to your email.',
          });
        } catch (e) {
          console.error('[AUTH] signup resend OTP email error:', e?.message);
          // Production: report failure
          return res.status(500).json({
            status: 'error',
            message: 'There was an error sending the OTP. Please try again later.',
          });
        }
      }
      
      // If user exists and is verified
      return res.status(400).json({
        status: 'fail',
        message: 'User with this email already exists. Please log in instead.',
      });
    }

    // 3) Generate OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // 4) Create new user (not verified yet)
    const newUser = await User.create({
      name,
      email,
      password,
      phone,
      otp,
      otpExpires,
    });

        // 5) Send verification email with OTP
    const verificationUrl = `${req.protocol}://${req.get('host')}/verify-email?otp=${otp}&email=${encodeURIComponent(email)}`;
    
    try {
      const verificationUrl = `${req.protocol}://${req.get('host')}/verify-email?otp=${otp}&email=${encodeURIComponent(email)}`;
      if (process.env.NODE_ENV !== 'production') {
        console.log('[AUTH] signup new user -> sending email', { to: email, verificationUrl });
      }
      await new Email(newUser, verificationUrl, otp).sendOTP();
      

      res.status(201).json({
        status: 'success',
        message: 'OTP sent to your email. Please verify your account.',
      });
    } catch (err) {
      // If email sending fails
      console.error('[AUTH] signup new user email error:', err?.message);
      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending the OTP email.',
        error: err.message
      });
      
      // Production: revert user creation and report failure
      await User.findByIdAndDelete(newUser._id);
      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending the email. Please try again later.',
      });
    }
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
    const { email, otp } = req.body;
    if (process.env.NODE_ENV !== 'production') {
      console.log('[AUTH] verifyOTP called', { email, otp });
    }

    // 1) Find user by email and check if OTP matches and is not expired
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() }
    });

    // 2) If OTP is invalid or expired
    if (!user) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[AUTH] verifyOTP invalid or expired', { email, otp });
      }
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid or expired OTP',
      });
    }

    // 3) Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // 4) Send welcome email (best-effort)
    try {
      const url = `${req.protocol}://${req.get('host')}`;
      await new Email(user, url).sendWelcome();
    } catch (e) {
      // do not fail verification if email fails
      console.warn('Welcome email failed:', e?.message);
    }

    // 5) Send success response without token
    return res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    console.error('[AUTH] verifyOTP handler error:', err?.message);
    res.status(500).json({
      status: 'error',
      message: 'Error verifying OTP',
      error: err.message,
    });
  }
};

// Resend OTP
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (process.env.NODE_ENV !== 'production') {
      console.log('[AUTH] resendOTP called', { email });
    }
    
    // 1) Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with this email',
      });
    }

    // 2) Generate new OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // 3) Update user with new OTP
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save({ validateBeforeSave: false });

    // 4) Send new OTP email
    try {
      const verificationUrl = `${req.protocol}://${req.get('host')}/verify-email?otp=${otp}&email=${encodeURIComponent(email)}`;
      if (process.env.NODE_ENV !== 'production') {
        console.log('[AUTH] resendOTP sending email', { to: email, verificationUrl });
      }
      await new Email(user, verificationUrl, otp).sendOTP();

      res.status(200).json({
        status: 'success',
        message: 'OTP resent successfully',
      });
    } catch (err) {
      // If email sending fails, still respond with success but log the error
      console.error('[AUTH] resendOTP email error:', err?.message);
      
      res.status(200).json({
        status: 'success',
        message: 'OTP generated but email could not be sent',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      });
    }
  } catch (err) {
    console.error('[AUTH] resendOTP handler error:', err?.message);
    res.status(500).json({
      status: 'error',
      message: 'Error sending OTP. Please try again.',
    });
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

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email, active: true }).select('+password +role');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password',
      });
    }

    // 3) Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({
        status: 'fail',
        message: 'Please verify your email address first',
      });
    }

    // 4) Generate session ID for tracking
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

    // 5) Set session cookie
    if (rememberMe) {
      // Set longer expiry for 'remember me' (30 days)
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      // Default session (expires when browser closes)
      req.session.cookie.expires = false;
    }

    // 6) Store user info in session
    req.session.userId = user._id;
    req.session.sessionId = sessionId;

    // 7) Send token to client
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

// Forgot password
export const forgotPassword = async (req, res, next) => {
  try {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'There is no user with that email address',
      });
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    try {
      const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
      
      await new Email(user, resetURL).sendPasswordReset();

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending the email. Try again later!',
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error processing your request',
    });
  }
};

// Reset password
export const resetPassword = async (req, res, next) => {
  try {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or has expired',
      });
    }

    // 3) Update password and clear reset token
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 4) Log the user in, send JWT
    createSendToken(user, 200, req, res);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error resetting password',
    });
  }
};

// Update password (for logged-in users)
export const updatePassword = async (req, res, next) => {
  try {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Your current password is wrong',
      });
    }

    // 3) If so, update password
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    await user.save();

    // 4) Log user in, send JWT
    createSendToken(user, 200, req, res);
  } catch (err) {
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
    const token = req.cookies?.jwt;
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Not authenticated',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid or expired token',
      });
    }

    // Ensure user exists and is active
    const user = await User.findById(decoded.id).select('+role');
    if (!user || !user.active) {
      return res.status(401).json({
        status: 'fail',
        message: 'User not found or inactive',
      });
    }

    // Issue fresh token and set cookie
    createSendToken(user, 200, req, res);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Could not refresh token',
    });
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
