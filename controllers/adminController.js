import User from '../models/User.js';
import Job from '../models/Job.js';
import Course from '../models/Course.js';
import Award from '../models/Award.js';
import Article from '../models/Article.js';
import Query from '../models/Query.js';
import Question from '../models/Question.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import AppError from '../utils/appError.mjs';
import catchAsync from '../utils/catchAsync.js';

// Get all users (for admin)
export const getAllUsers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';

  // Build the query
  const query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  // Get total count for pagination
  const total = await User.countDocuments(query);
  
  // Get paginated users
  const users = await User.find(query)
    .select('-password -otp -otpExpires -passwordResetToken -passwordResetExpires -activeSessions')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: 'success',
    results: users.length,
    total,
    data: {
      users
    }
  });
});

// Get single user (for admin)
export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password -otp -otpExpires -passwordResetToken -passwordResetExpires -activeSessions');

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Update user (for admin)
export const updateUser = catchAsync(async (req, res, next) => {
  // 1) Filter out unwanted fields that are not allowed to be updated
  const filteredBody = { ...req.body };
  const restrictedFields = ['password', 'passwordConfirm', 'role'];
  restrictedFields.forEach(field => delete filteredBody[field]);

  // 2) Update user document
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true
    }
  ).select('-password -otp -otpExpires -passwordResetToken -passwordResetExpires -activeSessions');

  if (!updatedUser) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Delete user (for admin)
export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Dashboard statistics (for admin)
export const getDashboardStats = catchAsync(async (req, res, next) => {
  // Parallelize counts
  const [
    users,
    jobs,
    courses,
    awards,
    articles,
    queries,
    questions,
    appointments,
    reviews,
    recentUsers,
    recentQueries,
    recentQuestions,
    recentAppointments
  ] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments(),
    Course.countDocuments(),
    Award.countDocuments(),
    Article.countDocuments(),
    Query.countDocuments(),
    Question.countDocuments(),
    Booking.countDocuments(),
    Review.countDocuments(),
    User.find()
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5),
    Query.find()
      .select('subject message user createdAt')
      .populate({ path: 'user', select: 'name' })
      .sort({ createdAt: -1 })
      .limit(5),
    Question.find()
      .select('subject message name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5),
    Booking.find()
      .select('type user date')
      .populate({ path: 'user', select: 'name' })
      .sort({ createdAt: -1 })
      .limit(5)
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      users,
      jobs,
      courses,
      awards,
      articles,
      queries,
      questions,
      appointments,
      reviews,
      recentUsers,
      recentQueries,
      recentQuestions,
      recentAppointments
    }
  });
});

// Bulk update users (for admin)
export const bulkUpdateUsers = catchAsync(async (req, res, next) => {
  const { userIds, updates } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return next(new AppError('Please provide user IDs to update', 400));
  }

  // Filter out restricted fields
  const filteredUpdates = { ...updates };
  const restrictedFields = ['password', 'passwordConfirm', 'role'];
  restrictedFields.forEach(field => delete filteredUpdates[field]);

  // Update multiple users
  const result = await User.updateMany(
    { _id: { $in: userIds } },
    filteredUpdates,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    }
  });
});

// Delete multiple users (for admin)
export const bulkDeleteUsers = catchAsync(async (req, res, next) => {
  const { userIds } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return next(new AppError('Please provide user IDs to delete', 400));
  }

  // Prevent deleting the current admin user
  const filteredUserIds = userIds.filter(id => id.toString() !== req.user.id);
  
  if (filteredUserIds.length === 0) {
    return next(new AppError('Cannot delete all selected users', 400));
  }

  const result = await User.deleteMany({ _id: { $in: filteredUserIds } });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Premium Users: create premium user (admin only)
export const createPremiumUser = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return next(new AppError('A user with this email already exists', 400));
  }

  const user = await User.create({
    name: name || email.split('@')[0],
    email,
    password,
    isVerified: true,
    isPremium: true
  });

  const safeUser = await User.findById(user._id).select('-password -otp -otpExpires -passwordResetToken -passwordResetExpires -activeSessions');

  res.status(201).json({
    status: 'success',
    data: { user: safeUser }
  });
});

// Premium Users: list premium users (admin only)
export const listPremiumUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ isPremium: true })
    .select('-password -otp -otpExpires -passwordResetToken -passwordResetExpires -activeSessions')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users }
  });
});

// Premium Users: set premium status (grant or revoke)
export const setPremiumStatus = catchAsync(async (req, res, next) => {
  const { isPremium } = req.body;
  if (typeof isPremium !== 'boolean') {
    return next(new AppError('isPremium boolean is required', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isPremium },
    { new: true, runValidators: true }
  ).select('-password -otp -otpExpires -passwordResetToken -passwordResetExpires -activeSessions');

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});
