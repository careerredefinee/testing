import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return /^\+?[1-9]\d{1,14}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // Premium access flag
    isPremium: {
      type: Boolean,
      default: false,
      index: true
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: String,
    otpExpires: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    activeSessions: [{
      sessionId: String,
      ip: String,
      userAgent: String,
      lastActivity: Date,
      _id: false
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Check if password is correct
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Filter out inactive users by default
userSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// Update passwordChangedAt when password is modified
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  // Set passwordChangedAt to current time minus 1 second to ensure token is created after
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Virtual for user's full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Method to get user's display name (can be overridden in subdocuments)
userSchema.methods.getDisplayName = function() {
  return this.name || this.email.split('@')[0];
};

// Method to check if user has a specific role
userSchema.methods.hasRole = function(role) {
  return this.role === role || this.role === 'admin';
};

// Create and export the User model
const User = mongoose.model('User', userSchema);

export default User;
