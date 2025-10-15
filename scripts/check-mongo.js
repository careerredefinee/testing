import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Configure dotenv to load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../config.env') });

const MONGO_URI = 'mongodb+srv://shanmukashanu:%2AintB00lean@shanmuka.trxjpfv.mongodb.net/?retryWrites=true&w=majority&appName=shanmuka';

async function testConnection() {
  console.log('Testing MongoDB connection...');
  console.log('Connection string:', MONGO_URI.replace(/:([^:@/])[^@]*@/, ':****@'));
  
  const client = new MongoClient(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // List all databases
    const adminDb = client.db().admin();
    const result = await adminDb.listDatabases();
    
    console.log('\nAvailable databases:');
    result.databases.forEach(db => console.log(`- ${db.name}`));
    
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
    
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the test
testConnection().catch(console.error);
