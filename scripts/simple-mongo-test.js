const { MongoClient } = require('mongodb');

// Simple MongoDB connection test
async function testMongo() {
  // Direct connection string (replace with your actual credentials)
  const uri = 'mongodb+srv://shanmukashanu:%2AintB00lean@shanmuka.trxjpfv.mongodb.net/test?retryWrites=true&w=majority';
  
  console.log('Attempting to connect to MongoDB...');
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');

    // Get the database and collection
    const db = client.db('test');
    const collection = db.collection('test');
    
    // Insert a test document
    const result = await collection.insertOne({ test: 'connection', timestamp: new Date() });
    console.log('✅ Test document inserted:', result.insertedId);
    
    // Find the test document
    const doc = await collection.findOne({ _id: result.insertedId });
    console.log('✅ Retrieved test document:', doc);
    
    // Delete the test document
    await collection.deleteOne({ _id: result.insertedId });
    console.log('✅ Cleaned up test document');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
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
testMongo().catch(console.error);
