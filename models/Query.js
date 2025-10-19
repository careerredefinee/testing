import mongoose from 'mongoose';

const querySchema = new mongoose.Schema(
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
    subject: {
      type: String,
      required: [true, 'Please provide a subject'],
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
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    category: {
      type: String,
      enum: ['general', 'technical', 'billing', 'feedback', 'other'],
      default: 'general',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    ipAddress: String,
    userAgent: String,
    responses: [
      {
        message: {
          type: String,
          required: true,
        },
        isAdmin: {
          type: Boolean,
          default: false,
        },
        admin: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        attachments: [
          {
            filename: String,
            path: String,
            size: Number,
            mimeType: String,
          },
        ],
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    lastResponseAt: Date,
    source: {
      type: String,
      enum: ['contact_form', 'email', 'api', 'admin', 'other'],
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

// Indexes for better query performance
querySchema.index({ status: 1, priority: 1, createdAt: -1 });
querySchema.index({ email: 1, createdAt: -1 });

// Virtual for response count
querySchema.virtual('responseCount').get(function () {
  return this.responses?.length || 0;
});

// Virtual for time since creation
querySchema.virtual('timeSinceCreation').get(function () {
  const now = new Date();
  const diffInSeconds = Math.floor((now - this.createdAt) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
});

// Method to add a response
querySchema.methods.addResponse = function (responseData) {
  this.responses.push(responseData);
  this.lastResponseAt = new Date();
  this.isRead = false;
  
  // Update status if it's a new response from admin
  if (responseData.isAdmin && this.status === 'new') {
    this.status = 'in_progress';
  }
  
  return this.save();
};

// Pre-save hook to set lastResponseAt if it's a new query
querySchema.pre('save', function(next) {
  if (this.isNew) {
    this.lastResponseAt = this.createdAt;
  }
  next();
});

const Query = mongoose.model('Query', querySchema);

export default Query;
