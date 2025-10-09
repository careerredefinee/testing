import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
    },
    message: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Please provide a date for the session'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Please select a time slot'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    meetingLink: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number, // in minutes
      default: 60,
    },
    type: {
      type: String,
      enum: ['consultation', 'demo', 'support', 'other'],
      default: 'consultation',
    },
    adminNotes: [
      {
        note: String,
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
bookingSchema.index({ user: 1, status: 1, date: 1 });

// Virtual for formatted date
bookingSchema.virtual('formattedDate').get(function () {
  if (!this.date) return null;
  try {
    return this.date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return null;
  }
});

// Check if booking is upcoming
bookingSchema.virtual('isUpcoming').get(function () {
  if (!this.date) return false;
  return new Date(this.date) > new Date() && this.status === 'confirmed';
});

// Add a method to check if the booking can be cancelled
bookingSchema.methods.canBeCancelled = function () {
  if (!this.date) return false;
  const now = new Date();
  const bookingTime = new Date(this.date);
  const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);
  
  return this.status === 'confirmed' && hoursUntilBooking > 24; // Can cancel up to 24 hours before
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
