import Job from '../models/Job.js';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import sharp from 'sharp';
import User from '../models/User.js';
import Email from '../utils/email.js';

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

// Get all active jobs
export const getAllJobs = async (req, res) => {
  try {
    const queryObj = { ...req.query, status: 'active' };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Job.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-postedAt');
    }

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    const total = await Job.countDocuments(JSON.parse(queryStr));
    
    if (req.query.page && skip >= total) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        data: { jobs: [] },
      });
    }

    query = query.skip(skip).limit(limit);
    const jobs = await query;

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: { jobs },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving jobs',
    });
  }
};

// Get a single job
export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        status: 'fail',
        message: 'No job found with that ID',
      });
    }

    if (job.status === 'active') {
      job.views += 1;
      await job.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      status: 'success',
      data: { job },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving job',
    });
  }
};

// Create a new job (Admin/Employer only)
export const createJob = async (req, res) => {
  try {
    // Align with Job model which uses 'postedBy'
    req.body.postedBy = req.user.id;
    const newJob = await Job.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { job: newJob },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Update a job (Admin/Employer only)
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        status: 'fail',
        message: 'No job found with that ID',
      });
    }

    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized to update this job',
      });
    }

    const filteredBody = filterObj(
      req.body,
      'title', 'description', 'requirements', 'responsibilities',
      'location', 'type', 'salary', 'status', 'applicationDeadline',
      'experienceLevel', 'skills', 'benefits'
    );

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      filteredBody,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: { job: updatedJob },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Error updating job',
    });
  }
};

// Delete a job (Admin/Employer only)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        status: 'fail',
        message: 'No job found with that ID',
      });
    }

    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized to delete this job',
      });
    }

    // Use a valid enum value to soft close the job
    job.status = 'closed';
    await job.save();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting job',
    });
  }
};

// Upload job logo
export const uploadJobLogo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  },
}).single('logo');

export const resizeJobLogo = async (req, res, next) => {
  if (!req.file) return next();
  
  try {
    const resizedImage = await sharp(req.file.buffer)
      .resize(300, 300, { fit: 'cover', position: 'center' })
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'career-redefine/jobs/logos', public_id: `job-logo-${Date.now()}` },
        (error, result) => error ? reject(error) : resolve(result)
      );
      stream.end(resizedImage);
    });

    req.body.companyLogo = result.secure_url;
    next();
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: 'Error processing image',
    });
  }
};

// Apply for a job
export const applyForJob = async (req, res) => {
  try {
    const [job, user] = await Promise.all([
      Job.findById(req.params.id),
      User.findById(req.user.id)
    ]);

    if (!job) {
      return res.status(404).json({
        status: 'fail',
        message: 'No job found with that ID',
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        status: 'fail',
        message: 'This job is no longer accepting applications',
      });
    }

    if (job.applications.some(a => a.user.toString() === req.user.id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'You have already applied for this job',
      });
    }

    job.applications.push({
      user: req.user.id,
      resume: req.body.resume,
      coverLetter: req.body.coverLetter,
      status: 'applied',
    });

    user.jobApplications.push({
      job: job._id,
      status: 'applied',
      appliedAt: Date.now(),
    });

    await Promise.all([
      job.save({ validateBeforeSave: false }),
      user.save({ validateBeforeSave: false })
    ]);

    // Notify employer
    const employer = await User.findById(job.postedBy);
    if (employer) {
      const applicationUrl = `${req.protocol}://${req.get('host')}/employer/applications/${job._id}`;
      const email = new Email(
        { email: employer.email, name: employer.name },
        applicationUrl
      );
      await email.send('jobApplication', 'New Job Application Received', {
        employerName: employer.name,
        jobTitle: job.title,
        applicantName: user.name,
        applicationUrl,
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Application submitted successfully',
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error submitting application',
    });
  }
};

// Get jobs by employer
export const getJobsByEmployer = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.params.employerId })
      .sort('-postedAt');
    res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: { jobs },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving jobs',
    });
  }
};

// Get featured jobs
export const getFeaturedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'active', isFeatured: true })
      .limit(5)
      .sort('-postedAt');
    res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: { jobs },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving featured jobs',
    });
  }
};
