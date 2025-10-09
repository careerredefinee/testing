const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './config.env' });

const ADMIN_EMAIL = 'shannu@admin.com';
const ADMIN_PASSWORD = '667700';

async function createAdmin() {
  const client = new MongoClient(process.env.MONGO_URI);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const usersCollection = db.collection('users');

    // Check if admin exists
    const admin = await usersCollection.findOne({ email: ADMIN_EMAIL });
    
    if (admin) {
      console.log('ℹ️ Admin user already exists:');
      console.log({
        _id: admin._id,
        email: admin.email,
        role: admin.role,
        isVerified: admin.isVerified,
        active: admin.active,
        createdAt: admin.createdAt
      });
      
      // Update existing admin
      console.log('\nUpdating admin user...');
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      
      await usersCollection.updateOne(
        { _id: admin._id },
        {
          $set: {
            name: 'Admin User',
            password: hashedPassword,
            role: 'admin',
            isVerified: true,
            active: true,
            phone: '+1234567890',
            updatedAt: new Date()
          }
        }
      );
      
      console.log('✅ Admin user updated successfully');
    } else {
      // Create new admin
      console.log('\nCreating new admin user...');
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      
      const result = await usersCollection.insertOne({
        name: 'Admin User',
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        active: true,
        phone: '+1234567890',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Admin user created successfully');
      console.log('User ID:', result.insertedId);
    }
    
    // Verify the admin user
    const updatedAdmin = await usersCollection.findOne({ email: ADMIN_EMAIL });
    console.log('\nAdmin user verified:');
    console.log({
      _id: updatedAdmin._id,
      email: updatedAdmin.email,
      role: updatedAdmin.role,
      isVerified: updatedAdmin.isVerified,
      active: updatedAdmin.active,
      createdAt: updatedAdmin.createdAt
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the function
createAdmin().catch(console.error);
