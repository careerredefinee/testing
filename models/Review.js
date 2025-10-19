import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: false,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: false,
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Please provide your review'],
      trim: true,
      maxlength: [2000, 'Review cannot be more than 2000 characters'],
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    response: {
      text: String,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      respondedAt: Date,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent duplicate reviews from the same user for the same course (only when course exists)
reviewSchema.index(
  { user: 1, course: 1 },
  { unique: true, partialFilterExpression: { course: { $exists: true } } }
);

// Calculate number of likes
reviewSchema.virtual('likesCount').get(function () {
  return this.likes?.length || 0;
});

// Check if the review is helpful (has more than 5 likes)
reviewSchema.virtual('isHelpful').get(function () {
  return this.likes?.length > 5;
});

// Update the course's average rating when a review is saved (if course is set)
reviewSchema.post('save', async function () {
  if (!this.course) return;
  const Course = mongoose.model('Course');
  await Course.findByIdAndUpdate(this.course, {
    $inc: { numReviews: 1 },
  });
  
  // Recalculate the average rating
  await this.constructor.calculateAverageRating(this.course);
});

// Recalculate average rating when a review is deleted (if course is set)
reviewSchema.post('remove', async function () {
  if (!this.course) return;
  const Course = mongoose.model('Course');
  await Course.findByIdAndUpdate(this.course, {
    $inc: { numReviews: -1 },
  });
  
  // Recalculate the average rating
  await this.constructor.calculateAverageRating(this.course);
});

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function (courseId) {
  const stats = await this.aggregate([
    {
      $match: { course: courseId, isApproved: true },
    },
    {
      $group: {
        _id: '$course',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Course').findByIdAndUpdate(courseId, {
      rating: stats[0].avgRating,
      numReviews: stats[0].nRating,
    });
  } else {
    await mongoose.model('Course').findByIdAndUpdate(courseId, {
      rating: 0,
      numReviews: 0,
    });
  }
};

const Review = mongoose.model('Review', reviewSchema);

export default Review;
