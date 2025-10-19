const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

console.log('Testing MongoDB connection...');
console.log('MONGO_URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB');
    
    // List all databases
    const adminDb = mongoose.connection.db.admin();
    adminDb.listDatabases((err, result) => {
      if (err) {
        console.error('Error listing databases:', err);
        process.exit(1);
      }
      
      console.log('\n📂 Available databases:');
      result.databases.forEach(db => {
        console.log(`- ${db.name} (Size: ${db.sizeOnDisk ? (db.sizeOnDisk / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'})`);
      });
      
      mongoose.connection.close();
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
