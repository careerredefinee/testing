import Call from '../models/Call.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.mjs';
import Email from '../utils/email.js';

// Helper: basic sanitization/normalization
const normalize = (val = '') => String(val || '').toString().trim();
const normalizePhone = (phone = '') => normalize(phone).replace(/[^0-9+]/g, '');

export const createCallbackRequest = catchAsync(async (req, res, next) => {
  const name = normalize(req.body?.name);
  const email = normalize(req.body?.email).toLowerCase();
  const phone = normalizePhone(req.body?.phone);
  const message = normalize(req.body?.message);

  // Validate required fields
  if (!name || !email || !phone) {
    return next(new AppError('Name, email and phone are required', 400));
  }

  // Simple email format guard (model has validator too)
  const emailOk = /\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(email);
  if (!emailOk) return next(new AppError('Please provide a valid email', 400));

  // Lightweight dedupe throttle: avoid multiple submissions within 3 minutes for same email+phone
  const threeMinAgo = new Date(Date.now() - 3 * 60 * 1000);
  const recent = await Call.findOne({ email, phone, createdAt: { $gte: threeMinAgo } }).lean();
  if (recent) {
    return res.status(201).json({
      status: 'success',
      data: { callback: recent },
      deduped: true
    });
  }

  // Create callback request (DB schema unchanged)
  const callback = await Call.create({ name, email, phone, message });

  // Fire-and-forget emails; do not block response
  (async () => {
    try {
      const userEmail = new Email({ name, email }, '');
      await userEmail.sendCallbackConfirmation();
    } catch (err) {
      console.error('Failed to send user confirmation email:', err);
    }
    try {
      const adminAddr = process.env.ADMIN_EMAIL || process.env.EMAIL_USERNAME || process.env.GMAIL_USER;
      if (adminAddr) {
        const adminEmail = new Email({ name: 'Admin', email: adminAddr }, '');
        await adminEmail.sendCallbackNotification({ name, email, phone, message });
      }
    } catch (err) {
      console.error('Failed to send admin notification email:', err);
    }
  })().catch(() => {});

  return res.status(201).json({
    status: 'success',
    data: { callback }
  });
});

export const getCallbackRequests = catchAsync(async (req, res, next) => {
  const callbacks = await Call.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: callbacks.length,
    data: {
      callbacks
    }
  });
});

export const deleteCallbackRequest = catchAsync(async (req, res, next) => {
  const callback = await Call.findByIdAndDelete(req.params.id);

  if (!callback) {
    return next(new AppError('No callback request found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

