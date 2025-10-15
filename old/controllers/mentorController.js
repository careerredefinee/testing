import Mentor from '../models/Mentor.js';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import sharp from 'sharp';

// Ensure Cloudinary configured in server.js as well
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj || {}).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Public: list mentors with basic filtering, sorting, pagination
export const getAllMentors = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in|nin)\b/g, (match) => `$${match}`);

    let query = Mentor.find(JSON.parse(queryStr));

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort({ order: 1, createdAt: -1 });
    }

    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    const page = +req.query.page || 1;
    const limit = +req.query.limit || 10;
    const skip = (page - 1) * limit;

    const total = await Mentor.countDocuments(JSON.parse(queryStr));
    if (req.query.page && skip >= total) {
      return res.status(200).json({ status: 'success', results: 0, data: { mentors: [] } });
    }

    const mentors = await query.skip(skip).limit(limit);

    res.status(200).json({ status: 'success', results: mentors.length, data: { mentors } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error retrieving mentors' });
  }
};

export const getMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ status: 'fail', message: 'Mentor not found' });
    res.status(200).json({ status: 'success', data: { mentor } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error retrieving mentor' });
  }
};

export const createMentor = async (req, res) => {
  try {
    const newMentor = await Mentor.create(req.body);
    res.status(201).json({ status: 'success', data: { mentor: newMentor } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

export const updateMentor = async (req, res) => {
  try {
    const filteredBody = filterObj(
      req.body,
      'name',
      'title',
      'company',
      'bio',
      'image',
      'linkedin',
      'isFeatured',
      'order',
      'active'
    );

    const mentor = await Mentor.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    if (!mentor) return res.status(404).json({ status: 'fail', message: 'Mentor not found' });

    res.status(200).json({ status: 'success', data: { mentor } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: 'Error updating mentor' });
  }
};

export const deleteMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findByIdAndDelete(req.params.id);
    if (!mentor) return res.status(404).json({ status: 'fail', message: 'Mentor not found' });

    if (mentor.image) {
      try {
        const parts = mentor.image.split('/');
        const last = parts[parts.length - 1];
        const publicId = last.split('.')[0];
        await cloudinary.uploader.destroy(`career-redefine/mentors/${publicId}`);
      } catch {}
    }

    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error deleting mentor' });
  }
};

// Image upload
const storage = multer.memoryStorage();
export const uploadMentorImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) cb(null, true);
    else cb(new Error('Not an image! Please upload only images.'), false);
  },
}).single('image');

export const resizeMentorImage = async (req, res, next) => {
  try {
    if (!req.file) return next();
    const processed = await sharp(req.file.buffer)
      .resize(800, 800, { fit: 'cover', position: 'center' })
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'career-redefine/mentors', public_id: `mentor-${Date.now()}` },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(processed);
    });

    req.body.image = result.secure_url;
    next();
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Error processing image' });
  }
};

export const getFeaturedMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find({ isFeatured: true }).sort({ order: 1, createdAt: -1 }).limit(20);
    res.status(200).json({ status: 'success', results: mentors.length, data: { mentors } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error retrieving featured mentors' });
  }
};
