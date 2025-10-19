import mongoose from 'mongoose';

const awardSchema = new mongoose.Schema(
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
    image: {
      type: String,
      required: [true, 'Please provide an image'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide the award date'],
    },
    issuedBy: {
      type: String,
      required: [true, 'Please provide the issuing organization'],
    },
    category: {
      type: String,
      enum: ['academic', 'professional', 'community', 'other'],
      default: 'other',
    },
    isFeatured: {
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

// Add text index for search functionality
awardSchema.index({ title: 'text', description: 'text', issuedBy: 'text' });

const Award = mongoose.model('Award', awardSchema);

export default Award;
