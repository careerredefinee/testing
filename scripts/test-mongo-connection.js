import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Configure dotenv to load environment variables
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../config.env') });

async function testConnection() {
  // Create a new client and connect to the MongoDB server
  const client = new MongoClient(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    socketTimeoutMS: 10000, // 10 seconds socket timeout
    connectTimeoutMS: 10000, // 10 seconds connection timeout
  });

  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Successfully connected to MongoDB!');
    
    // List all databases
    const adminDb = client.db().admin();
    const result = await adminDb.listDatabases();
    
    console.log('\nAvailable databases:');
    result.databases.forEach(db => console.log(`- ${db.name}`));
    
    // Get the database name from the connection string
    const dbName = process.env.MONGO_URI.split('/').pop().split('?')[0];
    console.log(`\nUsing database: ${dbName}`);
    
    // Try to access the users collection
    try {
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      console.log('\nCollections in database:');
      collections.forEach(coll => console.log(`- ${coll.name}`));
      
      // If users collection exists, count documents
      const usersCollection = collections.find(c => c.name === 'users');
      if (usersCollection) {
        const count = await db.collection('users').countDocuments();
        console.log(`\nFound ${count} users in the users collection`);
      } else {
        console.log('\n❌ Users collection not found');
      }
    } catch (err) {
      console.error('Error accessing database:', err.message);
    }
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    
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
    
  } finally {
    // Close the connection
    await client.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the test
testConnection().catch(console.error);
