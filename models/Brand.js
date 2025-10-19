import mongoose from 'mongoose';

const BrandSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Brand title is required'],
      trim: true,
      maxlength: [120, 'Title must be at most 120 characters']
    },
    type: {
      type: String,
      enum: ['accreditation', 'partner'],
      required: [true, 'Brand type is required'],
      index: true
    },
    text: {
      type: String,
      trim: true,
      maxlength: [300, 'Text must be at most 300 characters']
    },
    link: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      trim: true
    },
    order: {
      type: Number,
      default: 0,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('Brand', BrandSchema);
