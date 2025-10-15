import Champion from '../models/Champion.js';
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

// Public: list champions with basic filtering, sorting, pagination
export const getAllChampions = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in|nin)\b/g, (match) => `$${match}`);

    let query = Champion.find(JSON.parse(queryStr));

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

    const total = await Champion.countDocuments(JSON.parse(queryStr));
    if (req.query.page && skip >= total) {
      return res.status(200).json({ status: 'success', results: 0, data: { champions: [] } });
    }

    const champions = await query.skip(skip).limit(limit);

    res.status(200).json({ status: 'success', results: champions.length, data: { champions } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error retrieving champions' });
  }
};

export const getChampion = async (req, res) => {
  try {
    const champion = await Champion.findById(req.params.id);
    if (!champion) return res.status(404).json({ status: 'fail', message: 'Champion not found' });
    res.status(200).json({ status: 'success', data: { champion } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error retrieving champion' });
  }
};

export const createChampion = async (req, res) => {
  try {
    const newChampion = await Champion.create(req.body);
    res.status(201).json({ status: 'success', data: { champion: newChampion } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

export const updateChampion = async (req, res) => {
  try {
    const filteredBody = filterObj(
      req.body,
      'name',
      'company',
      'beforeRole',
      'afterRole',
      'testimonial',
      'rating',
      'image',
      'isFeatured',
      'order'
    );

    const champion = await Champion.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    if (!champion) return res.status(404).json({ status: 'fail', message: 'Champion not found' });

    res.status(200).json({ status: 'success', data: { champion } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: 'Error updating champion' });
  }
};

export const deleteChampion = async (req, res) => {
  try {
    const champion = await Champion.findByIdAndDelete(req.params.id);
    if (!champion) return res.status(404).json({ status: 'fail', message: 'Champion not found' });

    if (champion.image) {
      try {
        const parts = champion.image.split('/');
        const last = parts[parts.length - 1];
        const publicId = last.split('.')[0];
        await cloudinary.uploader.destroy(`career-redefine/champions/${publicId}`);
      } catch {}
    }

    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error deleting champion' });
  }
};

// Image upload
const storage = multer.memoryStorage();
export const uploadChampionImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) cb(null, true);
    else cb(new Error('Not an image! Please upload only images.'), false);
  },
}).single('image');

export const resizeChampionImage = async (req, res, next) => {
  try {
    if (!req.file) return next();
    const processed = await sharp(req.file.buffer)
      .resize(800, 800, { fit: 'cover', position: 'center' })
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'career-redefine/champions', public_id: `champion-${Date.now()}` },
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

export const getFeaturedChampions = async (req, res) => {
  try {
    const champions = await Champion.find({ isFeatured: true }).sort({ order: 1, createdAt: -1 }).limit(10);
    res.status(200).json({ status: 'success', results: champions.length, data: { champions } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error retrieving featured champions' });
  }
};
