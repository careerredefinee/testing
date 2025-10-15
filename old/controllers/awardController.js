import Award from '../models/Award.js';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import sharp from 'sharp';

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

// Get all awards
export const getAllAwards = async (req, res) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Award.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-date');
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

    const total = await Award.countDocuments(JSON.parse(queryStr));
    
    if (req.query.page) {
      if (skip >= total) {
        return res.status(200).json({
          status: 'success',
          results: 0,
          data: {
            awards: [],
          },
        });
      }
    }

    query = query.skip(skip).limit(limit);

    // Execute query
    const awards = await query;

    res.status(200).json({
      status: 'success',
      results: awards.length,
      data: {
        awards,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving awards',
    });
  }
};

// Get a single award
export const getAward = async (req, res) => {
  try {
    const award = await Award.findById(req.params.id);

    if (!award) {
      return res.status(404).json({
        status: 'fail',
        message: 'No award found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        award,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving award',
    });
  }
};

// Create a new award (Admin only)
export const createAward = async (req, res) => {
  try {
    // Create the award
    const newAward = await Award.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        award: newAward,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Update an award (Admin only)
export const updateAward = async (req, res) => {
  try {
    // Filter out unwanted fields
    const filteredBody = filterObj(
      req.body,
      'title',
      'description',
      'date',
      'issuedBy',
      'category',
      'isFeatured',
      'image',
      'externalLink'
    );

    const updatedAward = await Award.findByIdAndUpdate(
      req.params.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedAward) {
      return res.status(404).json({
        status: 'fail',
        message: 'No award found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        award: updatedAward,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Error updating award',
    });
  }
};

// Delete an award (Admin only)
export const deleteAward = async (req, res) => {
  try {
    const award = await Award.findByIdAndDelete(req.params.id);

    if (!award) {
      return res.status(404).json({
        status: 'fail',
        message: 'No award found with that ID',
      });
    }

    // If there's an image, delete it from Cloudinary
    if (award.image) {
      const publicId = award.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`career-redefine/awards/${publicId}`);
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting award',
    });
  }
};

// Upload award image
const storage = multer.memoryStorage();

export const uploadAwardImage = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  },
}).single('image');

export const resizeAwardImage = async (req, res, next) => {
  try {
    if (!req.file) return next();

    // Process the image with Sharp
    const resizedImage = await sharp(req.file.buffer)
      .resize(800, 800, {
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
          folder: 'career-redefine/awards',
          public_id: `award-${Date.now()}`,
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

// Get featured awards
export const getFeaturedAwards = async (req, res) => {
  try {
    const awards = await Award.find({ isFeatured: true })
      .sort('-date')
      .limit(5);

    res.status(200).json({
      status: 'success',
      results: awards.length,
      data: {
        awards,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving featured awards',
    });
  }
};

// Get awards by category
export const getAwardsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const awards = await Award.find({ 
      category: category,
      isFeatured: true 
    }).sort('-date');

    res.status(200).json({
      status: 'success',
      results: awards.length,
      data: {
        awards,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving awards by category',
    });
  }
};
