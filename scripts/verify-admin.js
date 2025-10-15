import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

const ADMIN_EMAIL = 'shannu@admin.com';
const ADMIN_PASSWORD = '667700';

async function verifyAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Successfully connected to MongoDB');
    
    // Import the User model
    const User = (await import('../models/User.js')).default;
    
    // Check if admin user exists
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (admin) {
      console.log('\nℹ️ Admin user found:');
      console.log({
        _id: admin._id,
        email: admin.email,
        role: admin.role,
        isVerified: admin.isVerified,
        active: admin.active,
        createdAt: admin.createdAt
      });
      
      // Verify password
      const isPasswordCorrect = await bcrypt.compare(ADMIN_PASSWORD, admin.password);
      console.log('\nPassword verification:', isPasswordCorrect ? '✅ Correct' : '❌ Incorrect');
      
      // Update admin user if needed
      if (!isPasswordCorrect || admin.role !== 'admin' || !admin.isVerified || !admin.active) {
        console.log('\nUpdating admin user...');
        
        const update = {
          role: 'admin',
          isVerified: true,
          active: true,
          updatedAt: new Date()
        };
        
        // Only update password if it's incorrect
        if (!isPasswordCorrect) {
          console.log('Resetting admin password...');
          const salt = await bcrypt.genSalt(10);
          update.password = await bcrypt.hash(ADMIN_PASSWORD, salt);
        }
        
        admin = await User.findByIdAndUpdate(
          admin._id,
          update,
          { new: true, runValidators: true }
        );
        
        console.log('✅ Admin user updated successfully');
      } else {
        console.log('✅ Admin user is correctly configured');
      }
    } else {
      console.log('\n❌ Admin user not found. Creating one...');
      
      // Create new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      
      admin = await User.create({
        name: 'Admin User',
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        active: true,
        phone: '+1234567890'
      });
      
      console.log('✅ Admin user created successfully');
    }
    
    console.log('\nFinal admin user details:');
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
    
    if (error.name === 'MongoNetworkError') {
      console.error('\nNetwork error details:');
      console.error('- Check your internet connection');
      console.error('- Verify MongoDB Atlas IP whitelist');
      console.error('- Check if the MongoDB service is running');
    }
    
    if (error.name === 'MongoParseError') {
      console.error('\nConnection string format error:');
      console.error('- Check for special characters in username/password');
      console.error('- Ensure proper URL encoding is used');
    }
    
    process.exit(1);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the function
verifyAdmin();
