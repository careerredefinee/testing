import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // File-based fields are now optional to support text-only resumes
    filename: { type: String },
    mimetype: { type: String },
    size: { type: Number },
    content: { type: Buffer },
    // Always store extracted text
    extractedText: { type: String, required: true },
    analysis: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Resume', resumeSchema);
