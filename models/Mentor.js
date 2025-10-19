import mongoose from 'mongoose';

const mentorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    bio: { type: String, trim: true },
    image: { type: String, required: true }, // URL (Cloudinary or static)
    linkedin: { type: String, trim: true },
    isFeatured: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

mentorSchema.index({ order: 1 });

const Mentor = mongoose.model('Mentor', mentorSchema);
export default Mentor;
