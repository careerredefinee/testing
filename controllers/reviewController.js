import Review from '../models/Review.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import sharp from 'sharp';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload review images
const storage = multer.memoryStorage();

export const uploadReviewImages = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  },
}).array('images', 5); // Max 5 images per review

// Helper to process and upload images
export const processReviewImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  try {
    req.body.images = [];
    
    // Process each image
    await Promise.all(req.files.map(async (file) => {
      // Resize and format image
      const resizedImage = await sharp(file.buffer)
        .resize(1200, 800, {
          fit: 'cover',
          position: 'center',
          withoutEnlargement: true
        })
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toBuffer();

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'career-redefine/reviews',
            public_id: `review-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(resizedImage);
      });

      req.body.images.push({
        url: result.secure_url,
        publicId: result.public_id
      });
    }));

    next();
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: 'Error processing images',
    });
  }
};

// Get all reviews (with filtering)
export const getAllReviews = async (req, res) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Review.find(JSON.parse(queryStr))
      .populate('user', 'name photo')
      .populate('course', 'title slug');

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    const total = await Review.countDocuments(JSON.parse(queryStr));
    
    if (req.query.page) {
      if (skip >= total) {
        return res.status(200).json({
          status: 'success',
          results: 0,
          data: { reviews: [] },
        });
      }
    }

    query = query.skip(skip).limit(limit);

    // Execute query
    const reviews = await query;

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: { reviews },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving reviews',
    });
  }
};

// Get a single review
export const getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name photo')
      .populate('course', 'title slug');

    if (!review) {
      return res.status(404).json({
        status: 'fail',
        message: 'No review found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { review },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving review',
    });
  }
};

// Create a new review
export const createReview = async (req, res) => {
  try {
    let course = null;

    // If a course is provided, enforce course-specific constraints
    if (req.body.course) {
      // Check duplicate for same course
      const existingReview = await Review.findOne({
        user: req.user.id,
        course: req.body.course,
      });
      if (existingReview) {
        return res.status(400).json({
          status: 'fail',
          message: 'You have already reviewed this course',
        });
      }

      // Check enrollment
      course = await Course.findById(req.body.course);
      if (!course || !course.students.includes(req.user.id)) {
        return res.status(403).json({
          status: 'fail',
          message: 'You must be enrolled in the course to review it',
        });
      }
    }

    // Create review (general if no course provided)
    const review = await Review.create({
      ...req.body,
      user: req.user.id,
    });

    // Update course rating if applicable
    if (course?._id) {
      await updateCourseRating(course._id);
    }

    // Populate user and course for immediate UI rendering
    const populated = await Review.findById(review._id)
      .populate('user', 'name photo')
      .populate('course', 'title slug');

    res.status(201).json({
      status: 'success',
      data: { review: populated },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        status: 'fail',
        message: 'No review found with that ID',
      });
    }

    // Check if user is the author or admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this review',
      });
    }

    // Filter out unwanted fields
    const { rating, comment, images } = req.body;
    const updateData = {};
    
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;
    if (images !== undefined) updateData.images = images;

    // Update review
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Update course rating if rating was changed
    if (rating !== undefined && review.course) {
      await updateCourseRating(review.course);
    }

    const populated = await Review.findById(updatedReview._id)
      .populate('user', 'name photo')
      .populate('course', 'title slug');

    res.status(200).json({
      status: 'success',
      data: { review: populated },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Error updating review',
    });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        status: 'fail',
        message: 'No review found with that ID',
      });
    }

    // Check if user is the author or admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this review',
      });
    }

    const courseId = review.course;
    
    // Delete review images from Cloudinary
    if (review.images && review.images.length > 0) {
      await Promise.all(
        review.images.map(img => 
          cloudinary.uploader.destroy(img.publicId)
        )
      );
    }

    // Delete the review
    await Review.findByIdAndDelete(req.params.id);

    // Update course rating if applicable
    if (courseId) {
      await updateCourseRating(courseId);
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting review',
    });
  }
};

// Helper function to update course rating
const updateCourseRating = async (courseId) => {
  try {
    const stats = await Review.aggregate([
      {
        $match: { course: courseId }
      },
      {
        $group: {
          _id: '$course',
          nRating: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    if (stats.length > 0) {
      await Course.findByIdAndUpdate(courseId, {
        ratingsAverage: stats[0].avgRating,
        ratingsQuantity: stats[0].nRating
      });
    } else {
      await Course.findByIdAndUpdate(courseId, {
        ratingsAverage: 0,
        ratingsQuantity: 0
      });
    }
  } catch (err) {
    console.error('Error updating course rating:', err);
  }
};

// Get reviews for a specific course
export const getCourseReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate('user', 'name photo')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: { reviews },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving course reviews',
    });
  }
};

// Get reviews by a specific user
export const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.params.userId })
      .populate('course', 'title slug image')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: { reviews },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving user reviews',
    });
  }
};
