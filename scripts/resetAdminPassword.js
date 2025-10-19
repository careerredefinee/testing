require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ email: 'shannu@admin.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found. Creating a new one...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('667700', salt);
      
      // Create new admin user
      const newAdmin = await User.create({
        name: 'Admin User',
        email: 'shannu@admin.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        active: true,
        phone: '+1234567890'
      });
      
      console.log('✅ Admin user created successfully');
      console.log({
        email: newAdmin.email,
        role: newAdmin.role,
        isVerified: newAdmin.isVerified,
        active: newAdmin.active
      });
    } else {
      // Update existing admin user
      console.log('🔍 Found existing admin user. Updating password and status...');
      
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash('667700', salt);
      admin.isVerified = true;
      admin.active = true;
      admin.role = 'admin';
      
      await admin.save({ validateBeforeSave: false });
      
      console.log('✅ Admin user updated successfully');
      console.log({
        email: admin.email,
        role: admin.role,
        isVerified: admin.isVerified,
        active: admin.active
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

resetAdminPassword();
