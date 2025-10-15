import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    // SEO-friendly unique identifier
    slug: {
      type: String,
      unique: true,
      index: true,
      sparse: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide content'],
    },
    summary: {
      type: String,
      required: [true, 'Please provide a summary'],
      maxlength: [500, 'Summary cannot be more than 500 characters'],
    },
    image: {
      type: String,
      default: 'default-article.jpg',
    },
    // External link for "Read More"
    // Use alias so clients can read/write via 'link'
    readMoreLnk: {
      type: String,
      trim: true,
      alias: 'link',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add text index for search functionality
articleSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Middleware to set publishedAt when article is published
articleSchema.pre('save', function (next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  next();
});

// Helper to create URL-friendly slugs
function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes
}

// Ensure slug is set from title; add a short suffix to avoid duplicates
articleSchema.pre('save', function (next) {
  if (!this.slug || this.isModified('title')) {
    const base = slugify(this.title || 'article');
    const suffix = Math.random().toString(36).slice(2, 7);
    this.slug = `${base}-${suffix}`;
  }
  next();
});

const Article = mongoose.model('Article', articleSchema);

export default Article;
