import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: './config.env' });

const ADMIN_EMAIL = 'shannu@admin.com';
const ADMIN_PASSWORD = '667700';

async function checkAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const User = mongoose.model('User');
    const admin = await User.findOne({ email: ADMIN_EMAIL }).select('+password');

    if (!admin) {
      console.log('❌ Admin user not found');
      console.log('\nCreating admin user...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      
      // Create admin
      const newAdmin = await User.create({
        name: 'Admin User',
        email: ADMIN_EMAIL,
        password: hashedPassword,
        passwordConfirm: ADMIN_PASSWORD,
        role: 'admin',
        isVerified: true,
        active: true,
        phone: '+1234567890'
      });
      
      console.log('✅ Admin user created successfully');
      console.log('User ID:', newAdmin._id);
    } else {
      console.log('✅ Admin user found:');
      console.log({
        _id: admin._id,
        email: admin.email,
        role: admin.role,
        isVerified: admin.isVerified,
        active: admin.active,
        passwordMatch: admin.password ? 'Yes' : 'No',
        createdAt: admin.createdAt
      });

      // Verify password
      if (admin.password) {
        const isPasswordCorrect = await bcrypt.compare(ADMIN_PASSWORD, admin.password);
        console.log('🔑 Password check:', isPasswordCorrect ? '✅ Correct' : '❌ Incorrect');
        
        if (!isPasswordCorrect) {
          console.log('\nUpdating password...');
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
          
          await User.updateOne(
            { _id: admin._id },
            {
              $set: {
                password: hashedPassword,
                isVerified: true,
                active: true,
                role: 'admin'
              }
            }
          );
          
          console.log('✅ Admin user updated with new password');
        }
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the check
checkAdmin();
