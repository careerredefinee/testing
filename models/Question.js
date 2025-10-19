import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      default: 'General Question',
      trim: true,
      maxlength: [200, 'Subject cannot be more than 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Please provide your message'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'resolved', 'spam'],
      default: 'new',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ['contact_form', 'email', 'api', 'other'],
      default: 'contact_form',
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

questionSchema.index({ status: 1, createdAt: -1 });
questionSchema.index({ email: 1, createdAt: -1 });

const Question = mongoose.model('Question', questionSchema);
export default Question;
