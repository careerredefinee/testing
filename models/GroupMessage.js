import mongoose from 'mongoose';

const groupMessageSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, trim: true },
    media: {
      url: String,
      publicId: String,
      type: { type: String, enum: ['image', 'file'], default: 'file' },
      mimetype: String,
      size: Number,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('GroupMessage', groupMessageSchema);
