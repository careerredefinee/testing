import Call from '../models/Call.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.mjs';
import Email from '../utils/email.js';

export const createCallbackRequest = catchAsync(async (req, res, next) => {
  const { name, email, phone, message } = req.body;

  // Create callback request
  const callback = await Call.create({
    name,
    email,
    phone,
    message
  });

  // Send confirmation email to user
  try {
    const userEmail = new Email({ name, email }, '');
    await userEmail.sendCallbackConfirmation();
  } catch (err) {
    console.error('Failed to send user confirmation email:', err);
  }

  // Send notification email to admin
  try {
    const adminEmail = new Email({ name: 'Admin', email: process.env.ADMIN_EMAIL }, '');
    await adminEmail.sendCallbackNotification({ name, email, phone, message });
  } catch (err) {
    console.error('Failed to send admin notification email:', err);
  }

  res.status(201).json({
    status: 'success',
    data: {
      callback
    }
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
