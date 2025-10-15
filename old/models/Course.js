import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Please provide a short description'],
      maxlength: [500, 'Short description cannot be more than 500 characters'],
    },
    image: {
      type: String,
      required: [true, 'Please provide a course image'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide the course price'],
      min: [0, 'Price cannot be negative'],
    },
    duration: {
      type: Number, // in weeks
      required: [true, 'Please provide the course duration in weeks'],
      min: [1, 'Duration must be at least 1 week'],
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
    },
    syllabus: [
      {
        week: Number,
        title: String,
        topics: [String],
        resources: [
          {
            title: String,
            type: {
              type: String,
              enum: ['video', 'article', 'pdf', 'assignment', 'quiz'],
              required: true,
            },
            url: String,
            duration: Number, // in minutes
          },
        ],
      },
    ],
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pageLink: {
      type: String,
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    maxStudents: {
      type: Number,
      default: 100,
    },
    enrolledStudents: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    requirements: [String],
    learningOutcomes: [String],
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add text index for search functionality
courseSchema.index({
  title: 'text',
  description: 'text',
  shortDescription: 'text',
  category: 'text',
  tags: 'text',
});

// Virtual for getting the number of enrolled students
courseSchema.virtual('enrolledCount').get(function () {
  return this.enrolledStudents.length;
});

// Calculate average rating
courseSchema.methods.calculateAverageRating = async function () {
  const reviews = await this.model('Review').find({ course: this._id });
  if (reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
    return;
  }
  
  const total = reviews.reduce((acc, item) => item.rating + acc, 0);
  this.rating = total / reviews.length;
  this.numReviews = reviews.length;
  await this.save();
};

const Course = mongoose.model('Course', courseSchema);

export default Course;
