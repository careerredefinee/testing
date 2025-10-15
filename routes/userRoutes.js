import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { 
  uploadUserPhoto, 
  resizeUserPhoto, 
  getUser,
  getMyEnrolledCourses,
  getMyReviews,
  getMyBookings,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserStats
} from '../controllers/userController.js';
import { 
  getMe, 
  updateMe, 
  updatePassword, 
  deleteMe 
} from '../controllers/authController.js';

const router = express.Router();

// Apply protection to all routes after this middleware
router.use(protect);

// User profile routes
router.get('/me', getMe, getUser);
router.patch('/update-me', uploadUserPhoto, resizeUserPhoto, updateMe);
router.patch('/update-password', updatePassword);
router.delete('/delete-me', deleteMe);

// User data routes
router.get('/my-courses', getMyEnrolledCourses);
router.get('/my-reviews', getMyReviews);
router.get('/my-bookings', getMyBookings);

// Admin routes
router.use(restrictTo('admin'));

router
  .route('/')
  .get(getAllUsers);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

router.get('/stats/users', getUserStats);

export default router;
