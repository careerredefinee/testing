const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './config.env' });

async function testConnection() {
  // Create a new client and connect to MongoDB
  const client = new MongoClient(process.env.MONGO_URI);
  
  try {
    console.log('Attempting to connect to MongoDB...');
    // Try to connect to the server
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // Get the database name from the connection string
    const dbName = process.env.MONGO_URI.split('/').pop().split('?')[0];
    console.log(`Using database: ${dbName}`);
    
    // List all databases to verify connection
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    
    console.log('\nAvailable databases:');
    dbs.databases.forEach(db => console.log(`- ${db.name}`));
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    console.error('Error details:', error);
    
    if (error.name === 'MongoServerError') {
      console.error('\nMongoDB Error Code:', error.code);
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
