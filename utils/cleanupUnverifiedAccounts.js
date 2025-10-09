import User from '../models/User.js';

// Remove unverified accounts older than 24 hours
const cleanupUnverifiedAccounts = async () => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: oneDayAgo }
    });
    
    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} unverified accounts`);
    }
    
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up unverified accounts:', error);
    return 0;
  }
};

// Run cleanup when this module is imported (e.g., on server start)
cleanupUnverifiedAccounts();

// Run cleanup every 24 hours
setInterval(cleanupUnverifiedAccounts, 24 * 60 * 60 * 1000);

export default cleanupUnverifiedAccounts;
