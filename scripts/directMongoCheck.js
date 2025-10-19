const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './config.env' });

async function checkAdmin() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    
    // Check if users collection exists
    const collections = await db.listCollections().toArray();
    const userCollections = collections.filter(c => c.name === 'users');
    
    if (userCollections.length === 0) {
      console.log('❌ Users collection does not exist');
      return;
    }
    
    console.log('🔍 Checking admin user...');
    const adminUser = await db.collection('users').findOne({ email: 'shannu@admin.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      console.log('\nCreating admin user...');
      
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('667700', salt);
      
      const result = await db.collection('users').insertOne({
        name: 'Admin User',
        email: 'shannu@admin.com',
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
    } else {
      console.log('✅ Admin user found:');
      console.log({
        _id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role,
        isVerified: adminUser.isVerified,
        active: adminUser.active !== false, // Default to true if not set
        createdAt: adminUser.createdAt
      });
      
      // Verify password
      if (adminUser.password) {
        const bcrypt = require('bcryptjs');
        const isPasswordCorrect = await bcrypt.compare('667700', adminUser.password);
        console.log('🔑 Password check:', isPasswordCorrect ? '✅ Correct' : '❌ Incorrect');
        
        if (!isPasswordCorrect) {
          console.log('\nUpdating password...');
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash('667700', salt);
          
          await db.collection('users').updateOne(
            { _id: adminUser._id },
            {
              $set: {
                password: hashedPassword,
                isVerified: true,
                active: true,
                role: 'admin',
                updatedAt: new Date()
              }
            }
          );
          
          console.log('✅ Admin user updated with new password');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) console.error(error.stack);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 MongoDB connection closed');
    }
  }
}

// Run the check
checkAdmin();
