import Article from '../models/Article.js';
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

// Get all published articles
export const getAllArticles = async (req, res) => {
  try {
    // Build query
    const queryObj = { ...req.query, isPublished: true };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Article.find(JSON.parse(queryStr)).populate('author', 'name photo');

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-publishedAt');
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

    const total = await Article.countDocuments(JSON.parse(queryStr));
    
    if (req.query.page) {
      if (skip >= total) {
        return res.status(200).json({
          status: 'success',
          results: 0,
          data: {
            articles: [],
          },
        });
      }
    }

    query = query.skip(skip).limit(limit);

    // Execute query
    const articles = await query;

    // Normalize link field for frontend compatibility
    const normalized = articles.map((doc) => {
      const obj = doc.toObject ? doc.toObject() : doc;
      return {
        ...obj,
        link: obj.link || obj.readMoreLnk || undefined,
      };
    });

    res.status(200).json({
      status: 'success',
      results: normalized.length,
      data: {
        articles: normalized,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving articles',
    });
  }
};

// Get a single article
export const getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'name photo')
      .populate('relatedCourses', 'title slug');

    if (!article) {
      return res.status(404).json({
        status: 'fail',
        message: 'No article found with that ID',
      });
    }

    const obj = article.toObject ? article.toObject() : article;

    res.status(200).json({
      status: 'success',
      data: {
        article: { ...obj, link: obj.link || obj.readMoreLnk || undefined },
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving article',
    });
  }
};

// Create a new article (Admin/Author only)
export const createArticle = async (req, res) => {
  try {
    // Only allow admins and authors to create articles
    if (req.user.role !== 'admin' && req.user.role !== 'author') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to create articles',
      });
    }

    // Map incoming link to schema field if provided
    if (req.body.link && !req.body.readMoreLnk) {
      req.body.readMoreLnk = req.body.link;
    }

    // Set the author to the current user
    req.body.author = req.user.id;
    
    // Create the article
    const newArticle = await Article.create(req.body);

    const obj = newArticle.toObject ? newArticle.toObject() : newArticle;

    res.status(201).json({
      status: 'success',
      data: {
        article: { ...obj, link: obj.link || obj.readMoreLnk || undefined },
      },
    });
  } catch (err) {
    console.error('Error creating article:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Update an article (Admin/Author only)
export const updateArticle = async (req, res) => {
  try {
    // Find the article
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        status: 'fail',
        message: 'No article found with that ID',
      });
    }

    // Check if user is the author or admin
    if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this article',
      });
    }

    // Map incoming link to schema field if provided
    if (req.body.link && !req.body.readMoreLnk) {
      req.body.readMoreLnk = req.body.link;
    }

    // Filter out unwanted fields
    const filteredBody = filterObj(
      req.body,
      'title',
      'content',
      'summary',
      'tags',
      'link',
      'readMoreLnk',
      'isPublished',
      'image',
      'relatedCourses',
      'metaTitle',
      'metaDescription',
      'metaKeywords'
    );

    // Update the article
    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    const obj = updatedArticle.toObject ? updatedArticle.toObject() : updatedArticle;

    res.status(200).json({
      status: 'success',
      data: {
        article: { ...obj, link: obj.link || obj.readMoreLnk || undefined },
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Error updating article',
    });
  }
};

// Delete an article (Admin/Author only)
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        status: 'fail',
        message: 'No article found with that ID',
      });
    }

    // Check if user is the author or admin
    if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this article',
      });
    }

    // Soft delete by unpublishing the article
    article.isPublished = false;
    await article.save({ validateBeforeSave: false });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting article',
    });
  }
};

// Upload article image
const storage = multer.memoryStorage();

export const uploadArticleImage = multer({
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

export const resizeArticleImage = async (req, res, next) => {
  try {
    if (!req.file) return next();

    // Process the image with Sharp
    const resizedImage = await sharp(req.file.buffer)
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
          folder: 'career-redefine/articles',
          public_id: `article-${Date.now()}`,
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

    // Save the Cloudinary URL to the request object under schema field 'image'
    req.body.image = result.secure_url;
    next();
  } catch (err) {
    console.error('Error processing article image:', err);
    res.status(400).json({
      status: 'error',
      message: 'Error processing image: ' + err.message,
    });
  }
};

// Get articles by tag
export const getArticlesByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const articles = await Article.find({ 
      tags: tag,
      isPublished: true 
    })
      .sort('-publishedAt')
      .select('title summary image publishedAt slug tags readMoreLnk')
      .limit(10);

    const normalized = articles.map((doc) => {
      const obj = doc.toObject ? doc.toObject() : doc;
      return { ...obj, link: obj.link || obj.readMoreLnk || undefined };
    });

    res.status(200).json({
      status: 'success',
      results: normalized.length,
      data: {
        articles: normalized,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving articles by tag',
    });
  }
};

// Get featured articles
export const getFeaturedArticles = async (req, res) => {
  try {
    // Return latest published articles (no isFeatured flag in schema)
    const articles = await Article.find({ 
      isPublished: true
    })
      .sort('-publishedAt')
      .select('title summary image publishedAt slug tags readMoreLnk')
      .limit(5);

    const normalized = articles.map((doc) => {
      const obj = doc.toObject ? doc.toObject() : doc;
      return { ...obj, link: obj.link || obj.readMoreLnk || undefined };
    });

    res.status(200).json({
      status: 'success',
      results: normalized.length,
      data: {
        articles: normalized,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving featured articles',
    });
  }
};

// Search articles
export const searchArticles = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a search query',
      });
    }

    const articles = await Article.find(
      { 
        $text: { $search: query },
        isPublished: true 
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .select('title summary image publishedAt slug tags readMoreLnk')
      .limit(10);

    const normalized = articles.map((doc) => {
      const obj = doc.toObject ? doc.toObject() : doc;
      return { ...obj, link: obj.link || obj.readMoreLnk || undefined };
    });

    res.status(200).json({
      status: 'success',
      results: normalized.length,
      data: {
        articles: normalized,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error searching articles',
    });
  }
};
