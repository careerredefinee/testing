const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string:', process.env.MONGO_URI.replace(/:([^:@/])[^@]*@/, ':****@'));
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // List all databases
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.listDatabases();
    console.log('\nAvailable databases:');
    result.databases.forEach(db => console.log(`- ${db.name}`));
    
    // Check if our database is in the list
    const dbName = process.env.MONGO_URI.split('/').pop().split('?')[0];
    const dbExists = result.databases.some(db => db.name === dbName);
    
    if (dbExists) {
      console.log(`\n✅ Found database: ${dbName}`);
      
      // List collections in our database
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('\nCollections:');
      collections.forEach(collection => console.log(`- ${collection.name}`));
      
      // Check if users collection exists
      const usersCollection = collections.find(c => c.name === 'users');
      if (usersCollection) {
        console.log('\n✅ Found users collection');
        
        // Count users
        const userCount = await mongoose.connection.db.collection('users').countDocuments();
        console.log(`Total users: ${userCount}`);
        
        // Find admin user
        const adminUser = await mongoose.connection.db.collection('users').findOne({ email: 'shannu@admin.com' });
        if (adminUser) {
          console.log('\n✅ Found admin user:');
          console.log({
            _id: adminUser._id,
            email: adminUser.email,
            role: adminUser.role,
            isVerified: adminUser.isVerified,
            active: adminUser.active,
            createdAt: adminUser.createdAt
          });
        } else {
          console.log('\n❌ Admin user not found');
        }
      }
    } else {
      console.log(`\n❌ Database not found: ${dbName}`);
    }
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.error('Error details:', error);
    
    if (error.name === 'MongoServerError') {
      console.error('\nMongoDB Error Code:', error.code);
      console.error('MongoDB Error Message:', error.errmsg);
    }
    
    if (error.name === 'MongooseServerSelectionError') {
      console.error('\nPossible causes:');
      console.error('- Network connectivity issues');
      console.error('- Incorrect connection string');
      console.error('- MongoDB Atlas IP whitelist restrictions');
      console.error('- Authentication failed');
    }
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the test
testConnection().catch(console.error);
