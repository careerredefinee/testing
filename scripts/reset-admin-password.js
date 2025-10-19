import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Configure dotenv to load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../config.env') });

const ADMIN_EMAIL = 'shannu@admin.com';
const ADMIN_PASSWORD = '667700';

async function resetAdminPassword() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Successfully connected to MongoDB');
    
    // Define the User model
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      password: String,
      role: { type: String, default: 'user' },
      isVerified: { type: Boolean, default: false },
      active: { type: Boolean, default: true },
      phone: String,
      otp: String,
      otpExpires: Date,
      activeSessions: [{
        sessionId: String,
        ip: String,
        userAgent: String,
        lastActivity: Date,
        _id: false
      }],
      passwordChangedAt: Date,
      passwordResetToken: String,
      passwordResetExpires: Date,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }));
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
    
    // Try to update existing admin or create new one
    const admin = await User.findOneAndUpdate(
      { email: ADMIN_EMAIL },
      {
        $set: {
          name: 'Admin User',
          email: ADMIN_EMAIL,
          password: hashedPassword,
          role: 'admin',
          isVerified: true,
          active: true,
          phone: '+1234567890',
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: false
      }
    );
    
    console.log('✅ Admin user created/updated successfully');
    console.log('\nAdmin user details:');
    console.log({
      _id: admin._id,
      email: admin.email,
      role: admin.role,
      isVerified: admin.isVerified,
      active: admin.active,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    if (error.name === 'MongoServerError') {
      console.error('MongoDB Error Code:', error.code);
      console.error('MongoDB Error Message:', error.errmsg);
    }
    
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the function
resetAdminPassword().catch(console.error);
