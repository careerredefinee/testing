import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Optional: unique name per creator
groupSchema.index({ name: 1, createdBy: 1 }, { unique: true });

export default mongoose.model('Group', groupSchema);
