import express from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/login', authController.login);
router.post('/google-auth', authController.googleAuth);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
// OTP-based reset
router.post('/forgot-password-otp', authController.forgotPasswordOTP);
router.post('/reset-password-otp', authController.resetPasswordByOTP);
// Token refresh and logout to match frontend (POST)
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

// Protected routes (require authentication)
router.use(protect);

router.get('/me', authController.getMe);
router.patch('/update-me', authController.updateMe);
router.delete('/delete-me', authController.deleteMe);
router.patch('/update-password', authController.updatePassword);
// Keep GET /logout for compatibility
router.get('/logout', authController.logout);

export default router;
