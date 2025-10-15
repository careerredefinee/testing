import mongoose from 'mongoose';

const championSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    beforeRole: { type: String, required: true, trim: true },
    afterRole: { type: String, required: true, trim: true },
    testimonial: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    image: { type: String, required: true }, // URL (Cloudinary or static)
    isFeatured: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

championSchema.index({ order: 1 });

const Champion = mongoose.model('Champion', championSchema);
export default Champion;
