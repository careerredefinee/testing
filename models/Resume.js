import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    content: { type: Buffer, required: true },
    extractedText: { type: String },
    analysis: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Resume', resumeSchema);
