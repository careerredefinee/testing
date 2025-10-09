import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../models/User.js';

// Generate JWT Token
const signToken = (id, role = 'user') => {
  return jwt.sign(
    { 
      id,
      role,
      iat: Math.floor(Date.now() / 1000) - 30 // Add issued at time
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d',
      issuer: 'career-redefine'
    }
  );
};

// Create and send token
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id, user.role);

  // Detect if the request is cross-site (e.g., Vite dev at 5173 calling API at 3000)
  const reqOrigin = req.headers.origin || '';
  const host = `${req.protocol}://${req.get('host')}`; // e.g., http://localhost:3000
  const isCrossSiteRequest = reqOrigin && !reqOrigin.startsWith(host);
  const isLocalhost = /^(localhost|127\.0\.0\.1)$/i.test(req.hostname || '');

  // Enable cross-site cookies if:
  // - explicitly requested via env, or
  // - in production, or
  // - current request appears cross-site (different origin/port)
  const crossSite =
    process.env.CROSS_SITE_COOKIES === 'true' ||
    process.env.NODE_ENV === 'production' ||
    isCrossSiteRequest;

  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // SameSite rules:
    // - Cross-site XHR requires SameSite=None
    // - Same-site (same origin) can use Lax
    sameSite: crossSite ? 'none' : 'lax',
    // Secure flag:
    // - Required by browsers when SameSite=None on the public internet
    // - For localhost, allow insecure (http) during development
    secure: crossSite ? (!isLocalhost) : (process.env.NODE_ENV === 'production'),
    path: '/',
  };

  // Only set cookie domain in production. For localhost, omit the domain attribute
  // to allow the browser to treat it as a host-only cookie for 127.0.0.1/localhost
  if (process.env.NODE_ENV === 'production' && process.env.COOKIE_DOMAIN) {
    cookieOptions.domain = process.env.COOKIE_DOMAIN;
  }

  // Remove sensitive data from output
  user.password = undefined;
  user.otp = undefined;
  user.otpExpires = undefined;

  // Set JWT as HTTP-only cookie
  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// Protect routes - user must be logged in
export const protect = async (req, res, next) => {
  try {
    // 1) Get token and check if it exists
    let token;
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && /^Bearer\s+/i.test(authHeader)) {
      token = authHeader.split(/\s+/)[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.',
      });
    }

    // 2) Verify token
    let decoded;
    try {
      decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          status: 'fail',
          message: 'Invalid token. Please log in again!',
        });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'fail',
          message: 'Your session has expired! Please log in again.',
        });
      }
      throw error;
    }

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id).select('+role +passwordChangedAt +active');
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'fail',
        message: 'User recently changed password! Please log in again.',
      });
    }

    // 5) Check if user is active
    if (!currentUser.active) {
      return res.status(401).json({
        status: 'fail',
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed. Please log in again.',
    });
  }
};

// Restrict to certain roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};

// Only for rendered pages, no errors!
export const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) Verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

export { createSendToken, signToken };
