const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../config.env' });

const ADMIN_EMAIL = 'shannu@admin.com';
const ADMIN_PASSWORD = '667700';

async function createAdminUser() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Successfully connected to MongoDB');
    
    // Define the User model directly in the script
    const userSchema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      password: String,
      role: { type: String, default: 'user' },
      isVerified: { type: Boolean, default: true },
      active: { type: Boolean, default: true },
      phone: String,
      activeSessions: [{
        sessionId: String,
        ip: String,
        userAgent: String,
        lastActivity: Date,
        _id: false
      }],
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });
    
    const User = mongoose.model('User', userSchema);
    
    // Check if admin user already exists
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (admin) {
      console.log('ℹ️ Admin user already exists. Updating...');
      
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      
      // Update the existing admin user
      admin.password = hashedPassword;
      admin.role = 'admin';
      admin.isVerified = true;
      admin.active = true;
      admin.updatedAt = new Date();
      
      await admin.save();
      console.log('✅ Admin user updated successfully');
    } else {
      console.log('ℹ️ Creating new admin user...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      
      // Create new admin user
      admin = new User({
        name: 'Admin User',
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        active: true,
        phone: '+1234567890'
      });
      
      await admin.save();
      console.log('✅ Admin user created successfully');
    }
    
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
createAdminUser().catch(console.error);
