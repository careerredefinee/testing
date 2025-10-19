const { MongoClient } = require('mongodb');

// The connection string from config.env
const uri = 'mongodb+srv://shanmukashanu:%2AintB00lean@shanmuka.trxjpfv.mongodb.net/?retryWrites=true&w=majority&appName=shanmuka';

console.log('Testing MongoDB connection with URI:');
console.log(uri.replace(/:([^:@/])[^@]*@/, ':****@'));

async function testConnection() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    socketTimeoutMS: 10000, // 10 seconds socket timeout
    connectTimeoutMS: 10000, // 10 seconds connection timeout
  });

  try {
    console.log('\nAttempting to connect to MongoDB...');
    await client.connect();
    
    // Test the connection
    await client.db().command({ ping: 1 });
    console.log('✅ Successfully connected to MongoDB!');
    
    // List databases
    const dbs = await client.db().admin().listDatabases();
    console.log('\nAvailable databases:');
    dbs.databases.forEach(db => console.log(`- ${db.name}`));
    
    return true;
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
    
    return false;
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the test
testConnection()
  .then(success => {
    console.log(success ? '\n✅ Connection test completed successfully!' : '\n❌ Connection test failed');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
