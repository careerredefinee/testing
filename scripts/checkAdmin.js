require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

async function checkAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    const admin = await User.findOne({ email: 'shannu@admin.com' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    console.log('\n✅ Admin user found:');
    console.log({
      _id: admin._id,
      email: admin.email,
      role: admin.role,
      isVerified: admin.isVerified,
      active: admin.active,
      createdAt: admin.createdAt
    });

    // Check password
    const isPasswordCorrect = await admin.correctPassword('667700', admin.password);
    console.log('\n🔑 Password check:', isPasswordCorrect ? '✅ Correct' : '❌ Incorrect');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking admin:', error.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

checkAdmin();
