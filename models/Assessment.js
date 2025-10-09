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

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    contentType: { type: String, enum: ['text', 'media'], default: 'text' },
    textContent: { type: String },
    media: FileSchema, // for admin-provided media prompt
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    dueDate: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Optional index to quickly find assessments by assignee
assessmentSchema.index({ assignedTo: 1, createdAt: -1 });

const Assessment = mongoose.model('Assessment', assessmentSchema);
export default Assessment;
