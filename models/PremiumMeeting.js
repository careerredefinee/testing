import mongoose from 'mongoose';

const PremiumMeetingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    meetingLink: { type: String, default: '' },
    scheduledAt: { type: Date },
  },
  { timestamps: true }
);

PremiumMeetingSchema.index({ user: 1, createdAt: -1 });

const PremiumMeeting = mongoose.model('PremiumMeeting', PremiumMeetingSchema);
export default PremiumMeeting;
