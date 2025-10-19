import mongoose from 'mongoose';

const callSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    validate: {
      validator: function(email) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Please provide a valid email'
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'resolved'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for admin queries
callSchema.index({ createdAt: -1 });
callSchema.index({ status: 1 });

const Call = mongoose.model('Call', callSchema);

export default Call;
