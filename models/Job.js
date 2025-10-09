import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
      maxlength: [200, 'Job title cannot be more than 200 characters'],
    },
    company: {
      type: String,
      required: [true, 'Please provide a company name'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide a location'],
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
      default: 'full-time',
    },
    category: {
      type: String,
      required: [true, 'Please provide a job category'],
    },
    companyLogo: {
      type: String,
      trim: true,
    },
    salary: {
      min: {
        type: Number,
        min: 0,
      },
      max: {
        type: Number,
        validate: {
          validator: function (value) {
            return value >= this.salary.min;
          },
          message: 'Maximum salary must be greater than or equal to minimum salary',
        },
      },
      currency: {
        type: String,
        default: 'USD',
      },
      isNegotiable: {
        type: Boolean,
        default: false,
      },
      isConfidential: {
        type: Boolean,
        default: false,
      },
    },
    description: {
      type: String,
      required: [true, 'Please provide a job description'],
    },
    requirements: {
      experience: {
        min: {
          type: Number,
          min: 0,
        },
        max: {
          type: Number,
        },
        isRequired: {
          type: Boolean,
          default: true,
        },
      },
      skills: [String],
      education: {
        degree: String,
        field: String,
        isRequired: {
          type: Boolean,
          default: false,
        },
      },
    },
    responsibilities: [String],
    benefits: [String],
    applicationUrl: {
      type: String,
      required: [true, 'Please provide an application URL'],
    },
    isRemote: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'closed', 'draft'],
      default: 'active',
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicationDeadline: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
    applications: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['pending', 'reviewed', 'shortlisted', 'rejected'],
          default: 'pending',
        },
        resume: String,
        coverLetter: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add text index for search functionality
jobSchema.index({
  title: 'text',
  company: 'text',
  description: 'text',
  'requirements.skills': 'text',
  category: 'text',
  location: 'text',
});

// Virtual for getting the number of applications
jobSchema.virtual('applicationCount').get(function () {
  return this.applications.length;
});

// Update view count
jobSchema.methods.incrementViewCount = async function () {
  this.views += 1;
  await this.save();
};

const Job = mongoose.model('Job', jobSchema);

export default Job;
