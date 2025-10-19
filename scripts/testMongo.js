const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

console.log('MONGO_URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
