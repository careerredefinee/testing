import Course from '../models/Course.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import { promisify } from 'util';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer';
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

// Get all published courses
export const getAllCourses = async (req, res) => {
  try {
    // Build query
    const queryObj = { ...req.query, isPublished: true };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Course.find(JSON.parse(queryStr)).populate('instructor', 'name photo');

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

    const total = await Course.countDocuments(JSON.parse(queryStr));
    
    if (req.query.page) {
      if (skip >= total) {
        return res.status(200).json({
          status: 'success',
          results: 0,
          data: {
            courses: [],
          },
        });
      }
    }

    query = query.skip(skip).limit(limit);

    // Execute query
    const courses = await query;

    res.status(200).json({
      status: 'success',
      results: courses.length,
      data: {
        courses,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving courses',
    });
  }
};

// Get a single course
export const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name photo bio')
      .populate({
        path: 'reviews',
        select: 'rating review user createdAt',
        populate: {
          path: 'user',
          select: 'name photo',
        },
      });

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'No course found with that ID',
      });
    }

    // If user is enrolled, include progress and completion status
    if (req.user) {
      const user = await User.findById(req.user.id);
      const enrollment = user.enrolledCourses.find(
        (enrollment) => enrollment.course.toString() === req.params.id
      );
      
      if (enrollment) {
        course.enrollment = {
          progress: enrollment.progress,
          completed: enrollment.completed,
          completedLessons: enrollment.completedLessons || [],
        };
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        course,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving course',
    });
  }
};

// Create a new course (Instructor/Admin only)
export const createCourse = async (req, res) => {
  try {
    // Only allow instructors and admins to create courses
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only instructors can create courses',
      });
    }

    // Set the instructor to the current user
    req.body.instructor = req.user.id;
    // Ensure an image has been uploaded and processed by middleware
    if (!req.body.image) {
      return res.status(400).json({
        status: 'fail',
        message: 'Course image is required. Please attach an image file.',
      });
    }
    
    // Create the course
    const newCourse = await Course.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        course: newCourse,
      },
    });
  } catch (err) {
    // Helpful server-side log for diagnostics
    console.error('Error creating course:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Update a course (Instructor/Admin only)
export const updateCourse = async (req, res) => {
  try {
    // Find the course
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'No course found with that ID',
      });
    }

    // Check if user is the instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this course',
      });
    }

    // Filter out unwanted fields
    const filteredBody = filterObj(
      req.body,
      'title',
      'description',
      'shortDescription',
      'price',
      'duration',
      'level',
      'category',
      'pageLink',
      'requirements',
      'learningOutcomes',
      'tags',
      'isPublished'
    );

    // Update the course
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        course: updatedCourse,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Error updating course',
    });
  }
};

// Delete a course (Instructor/Admin only)
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'No course found with that ID',
      });
    }

    // Check if user is the instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this course',
      });
    }

    // Soft delete by setting isPublished to false
    course.isPublished = false;
    await course.save();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting course',
    });
  }
};

// Enroll in a course
export const enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'No course found with that ID',
      });
    }

    // Check if course is published
    if (!course.isPublished) {
      return res.status(400).json({
        status: 'fail',
        message: 'This course is not available for enrollment',
      });
    }

    // Check if user is already enrolled
    const user = await User.findById(req.user.id);
    const isEnrolled = user.enrolledCourses.some(
      (enrollment) => enrollment.course.toString() === req.params.id
    );

    if (isEnrolled) {
      return res.status(400).json({
        status: 'fail',
        message: 'You are already enrolled in this course',
      });
    }

    // Add course to user's enrolled courses
    user.enrolledCourses.push({
      course: course._id,
      enrolledAt: Date.now(),
    });

    await user.save({ validateBeforeSave: false });

    // Add user to course's enrolled students
    course.enrolledStudents.push({
      user: user._id,
      enrolledAt: Date.now(),
    });

    await course.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Successfully enrolled in the course',
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error enrolling in course',
    });
  }
};

// Upload course files (image + syllabus) in a single multipart pass
const storage = multer.memoryStorage();

export const uploadCourseAssets = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // per-file limit
  fileFilter: (req, file, cb) => {
    try {
      if (file.fieldname === 'image') {
        if (file.mimetype.startsWith('image/')) return cb(null, true);
        return cb(new Error('Not an image! Please upload only images.'));
      }
      if (file.fieldname === 'syllabus') {
        if (file.mimetype === 'application/pdf') return cb(null, true);
        return cb(new Error('Only PDF files are allowed for syllabus'));
      }
      // Disallow unexpected file fields
      return cb(new Error('Unexpected file field'));
    } catch (e) {
      return cb(e);
    }
  },
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'syllabus', maxCount: 1 },
]);

export const resizeCourseImage = async (req, res, next) => {
  try {
    const file = Array.isArray(req.files?.image) ? req.files.image[0] : undefined;
    if (!file) return next();

    // Process the image with Sharp
    const resizedImage = await sharp(file.buffer)
      .resize(1200, 630, {
        fit: 'cover',
        position: 'center',
      })
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'career-redefine/courses',
          public_id: `course-${Date.now()}`,
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
    req.body.image = result.secure_url;
    next();
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: 'Error processing image',
    });
  }
};

export const processSyllabus = async (req, res, next) => {
  try {
    const file = Array.isArray(req.files?.syllabus) ? req.files.syllabus[0] : undefined;
    if (!file) return next();

    // Upload PDF to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'career-redefine/syllabus',
          public_id: `syllabus-${Date.now()}`,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.end(file.buffer);
    });

    // Save the Cloudinary URL to the request object
    req.body.syllabus = result.secure_url;
    next();
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: 'Error processing syllabus',
    });
  }
};

// Search courses
export const searchCourses = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a search query',
      });
    }

    const courses = await Course.find(
      { $text: { $search: query }, isPublished: true },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10);

    res.status(200).json({
      status: 'success',
      results: courses.length,
      data: {
        courses,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error searching courses',
    });
  }
};

// Get popular courses
export const getPopularCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .sort({ rating: -1, numReviews: -1, createdAt: -1 })
      .limit(5)
      .select('title image instructor price rating numReviews')
      .populate('instructor', 'name');

    res.status(200).json({
      status: 'success',
      results: courses.length,
      data: {
        courses,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving popular courses',
    });
  }
};
