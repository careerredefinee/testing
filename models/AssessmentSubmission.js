import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema(
  {
    url: String,
    publicId: String,
    originalName: String,
    mimetype: String,
    size: Number,
  },
  { _id: false }
);

const assessmentSubmissionSchema = new mongoose.Schema(
  {
    assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    file: FileSchema,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    reviewMessage: { type: String },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

assessmentSubmissionSchema.index({ assessment: 1, user: 1 }, { unique: false });

const AssessmentSubmission = mongoose.model('AssessmentSubmission', assessmentSubmissionSchema);
export default AssessmentSubmission;
