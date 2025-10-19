import multer from 'multer';
import User from '../models/User.js';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to filter object fields
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ active: { $ne: false } }).select('-__v -passwordChangedAt');
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving users',
    });
  }
};

// Get single user
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v -passwordChangedAt');
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that ID',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving user',
    });
  }
};

// Update user (Admin only)
export const updateUser = async (req, res) => {
  try {
    // Filter out unwanted fields that are not allowed to be updated
    const filteredBody = filterObj(
      req.body,
      'name',
      'email',
      'phone',
      'photo',
      'role',
      'isVerified'
    );

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating user',
    });
  }
};

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that ID',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting user',
    });
  }
};

// Upload user photo
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  },
});

export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto = async (req, res, next) => {
  try {
    if (!req.file) return next();

    // Process the image with Sharp
    const resizedImage = await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'career-redefine/users',
          public_id: `user-${req.user.id}-${Date.now()}`,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.end(resizedImage);
    });

    // Save the Cloudinary URL to the request object
    req.body.photo = result.secure_url;
    next();
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: 'Error processing image',
    });
  }
};

// Get user dashboard stats
export const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $match: { role: 'user' },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          numUsers: { $sum: 1 },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { month: 1 },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving user statistics',
    });
  }
};

// Get all enrolled courses for a user
export const getMyEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'enrolledCourses.course',
      select: 'title description image instructor duration level',
    });

    res.status(200).json({
      status: 'success',
      results: user.enrolledCourses.length,
      data: {
        courses: user.enrolledCourses,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving enrolled courses',
    });
  }
};

// Get all user reviews
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate({
        path: 'course',
        select: 'title image',
      })
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving your reviews',
    });
  }
};

// Get all user bookings
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .sort('-createdAt')
      .populate('adminNotes.createdBy', 'name email');

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving your bookings',
    });
  }
};
