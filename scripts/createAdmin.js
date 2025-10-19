import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from config.env
const envPath = path.join(__dirname, '..', 'config.env');
dotenv.config({ path: envPath });

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not defined in config.env');
  process.exit(1);
}

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'shannu@admin.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('667700', salt);

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'shannu@admin.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      phone: '+1234567890' // Add a default phone number
    });

    console.log('Admin user created successfully:', {
      email: adminUser.email,
      role: adminUser.role
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();
