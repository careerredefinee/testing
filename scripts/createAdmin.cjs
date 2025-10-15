require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not defined in config.env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
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

    console.log('✅ Admin user created successfully:', {
      email: adminUser.email,
      role: adminUser.role
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

createAdmin();
