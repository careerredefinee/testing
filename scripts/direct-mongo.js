const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './config.env' });

const ADMIN_EMAIL = 'shannu@admin.com';
const ADMIN_PASSWORD = '667700';

async function main() {
  // Create a new MongoClient
  const client = new MongoClient(process.env.MONGO_URI);

  try {
    // Connect to the MongoDB cluster
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');

    // Get the database and collection
    const db = client.db();
    const users = db.collection('users');

    // Check if admin user exists
    console.log('\nChecking for admin user...');
    let adminUser = await users.findOne({ email: ADMIN_EMAIL });

    if (adminUser) {
      console.log('ℹ️ Admin user already exists:');
      console.log({
        _id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role,
        isVerified: adminUser.isVerified,
        active: adminUser.active,
        createdAt: adminUser.createdAt
      });
    } else {
      console.log('❌ Admin user not found. Creating one...');
      
      // Hash the password
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      
      // Create the admin user
      const result = await users.insertOne({
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
      
      // Get the newly created user
      adminUser = await users.findOne({ _id: result.insertedId });
    }
    
    // Verify the admin user
    console.log('\nAdmin user details:');
    console.log({
      _id: adminUser._id,
      email: adminUser.email,
      role: adminUser.role,
      isVerified: adminUser.isVerified,
      active: adminUser.active,
      createdAt: adminUser.createdAt
    });
    
    // Verify password
    const bcrypt = require('bcryptjs');
    const isPasswordCorrect = await bcrypt.compare(ADMIN_PASSWORD, adminUser.password);
    console.log('\nPassword verification:');
    console.log(isPasswordCorrect ? '✅ Password is correct' : '❌ Password is incorrect');
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    // Close the connection
    await client.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the main function
main().catch(console.error);
