import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    size: { type: Number },
    mimetype: { type: String, default: 'application/pdf' },
  },
  { timestamps: true }
);

export default mongoose.model('Material', materialSchema);
