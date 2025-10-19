import Brand from '../models/Brand.js';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import sharp from 'sharp';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to filter allowed fields
const filterObj = (obj, ...allowed) => {
  const out = {};
  Object.keys(obj || {}).forEach((k) => {
    if (allowed.includes(k)) out[k] = obj[k];
  });
  return out;
};

// ---------- Public ----------
export const getAllBrands = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excluded = ['page', 'sort', 'limit', 'fields'];
    excluded.forEach((e) => delete queryObj[e]);

    // Default: only active unless explicitly overridden
    if (typeof queryObj.isActive === 'undefined') queryObj.isActive = true;

    // Support type filter: 'accreditation' | 'partner'
    if (queryObj.type && !['accreditation', 'partner'].includes(queryObj.type)) {
      delete queryObj.type;
    }

    let query = Brand.find(queryObj);

    // Sorting
    if (req.query.sort) {
      query = query.sort(req.query.sort.split(',').join(' '));
    } else {
      query = query.sort({ order: 1, createdAt: -1 });
    }

    // Field limiting
    if (req.query.fields) {
      query = query.select(req.query.fields.split(',').join(' '));
    } else {
      query = query.select('-__v');
    }

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 50;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    const brands = await query;

    res.status(200).json({
      status: 'success',
      results: brands.length,
      data: { brands },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error retrieving brands' });
  }
};

export const getBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ status: 'fail', message: 'Not found' });
    res.status(200).json({ status: 'success', data: { brand } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error retrieving brand' });
  }
};

// ---------- Admin CRUD ----------
export const createBrand = async (req, res) => {
  try {
    const body = filterObj(req.body, 'title', 'type', 'text', 'link', 'image', 'order', 'isActive');
    const created = await Brand.create(body);
    res.status(201).json({ status: 'success', data: { brand: created } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const body = filterObj(req.body, 'title', 'type', 'text', 'link', 'image', 'order', 'isActive');
    const updated = await Brand.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ status: 'fail', message: 'Not found' });
    res.status(200).json({ status: 'success', data: { brand: updated } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: 'Error updating brand' });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ status: 'fail', message: 'Not found' });

    // Attempt to delete image from Cloudinary if present
    if (brand.image) {
      try {
        // Expect URL like https://res.cloudinary.com/<cloud>/image/upload/v123/career-redefine/brands/brand-...jpg
        const parts = brand.image.split('/');
        const fileWithExt = parts[parts.length - 1];
        const publicId = 'career-redefine/brands/' + fileWithExt.substring(0, fileWithExt.lastIndexOf('.'));
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Cloudinary delete failed:', e.message);
        }
      }
    }

    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error deleting brand' });
  }
};

// ---------- Upload middleware ----------
const storage = multer.memoryStorage();
export const uploadBrandImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
}).single('image');

export const resizeBrandImage = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const processed = await sharp(req.file.buffer)
      .resize(500, 300, { fit: 'inside', withoutEnlargement: true })
      .toFormat('jpeg')
      .jpeg({ quality: 85 })
      .toBuffer();

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'career-redefine/brands',
          public_id: `brand-${Date.now()}`,
          resource_type: 'image',
        },
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
